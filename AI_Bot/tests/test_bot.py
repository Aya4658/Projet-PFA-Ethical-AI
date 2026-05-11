import pytest
import requests
from playwright.sync_api import sync_playwright, expect
import subprocess
import time
import os
import sys

API_URL = "http://127.0.0.1:8000"

# ─── API UNIT TESTS (no browser needed) ────────────────────────────────────

class TestAPIDirectly:
    """Test the FastAPI /chat endpoint directly with HTTP requests."""

    def test_server_is_running(self):
        """Server must respond on port 8000."""
        response = requests.get(f"{API_URL}/docs")
        assert response.status_code == 200, "FastAPI server is not running on port 8000"

    def test_chat_returns_valid_json(self):
        """POST /chat must return JSON with a 'reply' key."""
        response = requests.post(
            f"{API_URL}/chat",
            json={"message": "Bonjour"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"]) > 0

    def test_known_product_returns_info(self):
        """Asking about a product that EXISTS in DB must NOT return 'introuvable'."""
        response = requests.post(
            f"{API_URL}/chat",
            json={"message": "Donne moi les informations sur Nike"}
        )
        data = response.json()
        reply = data["reply"].lower()
        assert "introuvable" not in reply, (
            f"BUG CONFIRMED: The bot said 'introuvable' for a known product. "
            f"Full reply: {data['reply']}"
        )

    def test_unknown_product_returns_sorry(self):
        """Asking about a product that does NOT exist in DB must return a polite refusal."""
        response = requests.post(
            f"{API_URL}/chat",
            json={"message": "Parle moi de la marque XYZ_INEXISTANTE_123"}
        )
        data = response.json()
        reply = data["reply"].lower()
        assert any(word in reply for word in ["désolé", "desole", "sais pas", "aucune"]), (
            f"Expected a polite refusal but got: {data['reply']}"
        )

    def test_empty_message_handled(self):
        """Empty message must not crash the server."""
        response = requests.post(
            f"{API_URL}/chat",
            json={"message": ""}
        )
        assert response.status_code == 200

    def test_french_question_with_stop_words(self):
        """Full French sentence must work after keyword extraction fix."""
        response = requests.post(
            f"{API_URL}/chat",
            json={"message": "Quel est le score éthique du produit Nike ?"}
        )
        data = response.json()
        reply = data["reply"].lower()
        assert "introuvable" not in reply, (
            f"Keyword extraction fix did not work. Full reply: {data['reply']}"
        )


# ─── BROWSER UI TESTS (Playwright) ─────────────────────────────────────────

class TestUIWithPlaywright:
    """Test the HTML test interface using Playwright browser automation."""

    @pytest.fixture(scope="class")
    def browser_page(self):
        ui_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "test_ui.html")
        )
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)  # headless=False to see the browser
            page = browser.new_page()
            page.goto(f"file:///{ui_path}")
            yield page
            browser.close()

    def test_page_title_visible(self, browser_page):
        """The UI page must load and show the title."""
        expect(browser_page.locator("h1")).to_be_visible()
        assert "Ethical" in browser_page.title() or \
               "Ethical" in browser_page.locator("h1").inner_text()

    def test_input_field_exists(self, browser_page):
        """The text input must be present and editable."""
        input_el = browser_page.locator("#user-input")
        expect(input_el).to_be_visible()
        input_el.fill("Test message")
        assert input_el.input_value() == "Test message"
        input_el.fill("")

    def test_send_button_exists(self, browser_page):
        """The Send button must be visible and clickable."""
        btn = browser_page.locator("#send-btn")
        expect(btn).to_be_visible()
        expect(btn).to_be_enabled()

    def test_clear_button_clears_chat(self, browser_page):
        """The Clear button must empty the chat box."""
        browser_page.locator("#user-input").fill("test")
        browser_page.locator("#send-btn").click()
        browser_page.wait_for_timeout(500)
        browser_page.locator("#clear-btn").click()
        chat_content = browser_page.locator("#chat-box").inner_text()
        assert chat_content.strip() == "", "Chat box was not cleared"

    def test_send_message_via_button(self, browser_page):
        """Typing a message and clicking Send must add it to the chat box."""
        browser_page.locator("#user-input").fill("Bonjour")
        browser_page.locator("#send-btn").click()
        browser_page.wait_for_timeout(3000)  # wait for API response
        chat_text = browser_page.locator("#chat-box").inner_text()
        assert "Bonjour" in chat_text, "User message not shown in chat"
        assert "AI" in chat_text or "bot" in chat_text.lower() or \
               len(chat_text) > 10, "Bot response not shown in chat"

    def test_send_message_via_enter_key(self, browser_page):
        """Pressing Enter must also send the message."""
        browser_page.locator("#clear-btn").click()
        browser_page.locator("#user-input").fill("Nike")
        browser_page.locator("#user-input").press("Enter")
        browser_page.wait_for_timeout(3000)
        chat_text = browser_page.locator("#chat-box").inner_text()
        assert "Nike" in chat_text

    def test_known_product_in_ui(self, browser_page):
        """Asking about a known product in UI must NOT show 'introuvable'."""
        browser_page.locator("#clear-btn").click()
        browser_page.locator("#user-input").fill(
            "Quel est le score éthique du produit Nike ?"
        )
        browser_page.locator("#send-btn").click()
        browser_page.wait_for_timeout(5000)  # allow Gemini API response
        chat_text = browser_page.locator("#chat-box").inner_text().lower()
        assert "introuvable" not in chat_text, (
            f"BUG: UI shows 'introuvable' for a known product. Chat: {chat_text}"
        )