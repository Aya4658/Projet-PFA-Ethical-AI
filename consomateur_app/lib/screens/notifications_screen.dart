import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<NotificationItem> notifications = [
    NotificationItem(
      id: '1',
      title: 'Score Update',
      message:
          'Organic Cotton T-Shirt\'s ethical score updated to 85/100',
      type: 'update',
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      read: false,
      relatedProduct: 'Organic Cotton T-Shirt',
    ),
    NotificationItem(
      id: '2',
      title: 'Alternative Found',
      message:
          'Found a more ethical alternative to the product you scanned',
      type: 'recommendation',
      timestamp: DateTime.now().subtract(const Duration(hours: 5)),
      read: false,
      relatedProduct: 'Eco-Friendly Bag',
    ),
    NotificationItem(
      id: '3',
      title: 'Promotion',
      message:
          'New sustainable products matching your preferences are available',
      type: 'promotion',
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      read: true,
      relatedProduct: null,
    ),
    NotificationItem(
      id: '4',
      title: 'Account',
      message: 'Welcome to EthicCommerce! Start building your ethical profile',
      type: 'account',
      timestamp: DateTime.now().subtract(const Duration(days: 2)),
      read: true,
      relatedProduct: null,
    ),
  ];

  void _markAsRead(String id) {
    setState(() {
      final index = notifications.indexWhere((n) => n.id == id);
      if (index >= 0) {
        notifications[index].read = true;
      }
    });
  }

  void _deleteNotification(String id) {
    setState(() {
      notifications.removeWhere((n) => n.id == id);
    });
  }

  void _markAllAsRead() {
    setState(() {
      for (var notification in notifications) {
        notification.read = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('All notifications marked as read'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'update':
        return Colors.blue;
      case 'recommendation':
        return AppColor.primaryGreen;
      case 'promotion':
        return AppColor.primaryOrange;
      case 'account':
        return AppColor.primaryGreen;
      default:
        return AppColor.darkGray;
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'update':
        return Icons.sync;
      case 'recommendation':
        return Icons.lightbulb;
      case 'promotion':
        return Icons.local_offer;
      case 'account':
        return Icons.account_circle;
      default:
        return Icons.notifications;
    }
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return dateTime.toString().split(' ')[0];
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = notifications.where((n) => !n.read).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        centerTitle: true,
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text('Mark all as read'),
            ),
        ],
      ),
      body: notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_off_outlined,
                    size: 80,
                    color: AppColor.mediumGray,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No notifications',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'You\'re all caught up!',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notification = notifications[index];
                final notifColor = _getNotificationColor(notification.type);

                return Dismissible(
                  key: Key(notification.id),
                  onDismissed: (direction) {
                    _deleteNotification(notification.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Notification deleted'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                  background: Container(
                    color: AppColor.error,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 16),
                    child: const Icon(
                      Icons.delete,
                      color: AppColor.white,
                    ),
                  ),
                  child: Card(
                    margin: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    color: notification.read
                        ? AppColor.white
                        : AppColor.primaryGreen.withOpacity(0.05),
                    child: ListTile(
                      onTap: () {
                        _markAsRead(notification.id);
                      },
                      leading: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: notifColor.withOpacity(0.2),
                        ),
                        child: Icon(
                          _getNotificationIcon(notification.type),
                          color: notifColor,
                        ),
                      ),
                      title: Row(
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleSmall
                                  ?.copyWith(
                                    fontWeight: notification.read
                                        ? FontWeight.w500
                                        : FontWeight.bold,
                                  ),
                            ),
                          ),
                          if (!notification.read)
                            Container(
                              width: 10,
                              height: 10,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColor.primaryGreen,
                              ),
                            ),
                        ],
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text(
                            notification.message,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatTime(notification.timestamp),
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color: AppColor.darkGray,
                                ),
                          ),
                        ],
                      ),
                      isThreeLine: true,
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String type; // update, recommendation, promotion, account
  final DateTime timestamp;
  bool read;
  final String? relatedProduct;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    required this.read,
    this.relatedProduct,
  });
}
