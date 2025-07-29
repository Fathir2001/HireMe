import { useEffect, useState } from "react";
import { FaBrain, FaExclamationTriangle, FaEye, FaTimes } from "react-icons/fa";
import "./recommendationNotifications.css";

interface RecommendationNotification {
  _id: string;
  title: string;
  description: string;
  priority: string;
  serviceType: string;
  daysUntil: number;
  isOverdue: boolean;
}

const RecommendationNotifications = () => {
  const [notifications, setNotifications] = useState<
    RecommendationNotification[]
  >([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchUrgentRecommendations();

    // Check for urgent recommendations every 5 minutes
    const interval = setInterval(fetchUrgentRecommendations, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchUrgentRecommendations = async () => {
    try {
      const token = localStorage.getItem("serviceNeederToken");
      const response = await fetch(
        "http://localhost:5000/api/ai-recommendations?priority=urgent&limit=3",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const urgentRecommendations =
          data.recommendations?.filter(
            (rec: RecommendationNotification) =>
              rec.priority === "urgent" || rec.isOverdue
          ) || [];

        if (urgentRecommendations.length > 0) {
          setNotifications(urgentRecommendations);
          setVisible(true);
        }
      }
    } catch (error) {
      console.error("Error fetching urgent recommendations:", error);
    }
  };

  const dismissNotification = async (recommendationId: string) => {
    try {
      const token = localStorage.getItem("serviceNeederToken");
      await fetch(
        `http://localhost:5000/api/ai-recommendations/${recommendationId}/action`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "viewed" }),
        }
      );

      setNotifications((prev) =>
        prev.filter((n) => n._id !== recommendationId)
      );

      if (notifications.length <= 1) {
        setVisible(false);
      }
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const handleViewRecommendations = () => {
    window.location.href = "/service-needer/recommendations";
  };

  if (!visible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="recommendation-notifications-overlay">
      <div className="recommendation-notifications-container">
        <div className="notifications-header">
          <div className="header-content">
            <FaBrain className="header-icon" />
            <div>
              <h3>Urgent Service Recommendations</h3>
              <p>{notifications.length} items need your attention</p>
            </div>
          </div>
          <button className="close-btn" onClick={() => setVisible(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.priority}`}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title}</h4>
                  {notification.isOverdue && (
                    <div className="overdue-badge">
                      <FaExclamationTriangle />
                      Overdue
                    </div>
                  )}
                </div>
                <p className="notification-description">
                  {notification.description.length > 100
                    ? `${notification.description.substring(0, 100)}...`
                    : notification.description}
                </p>
                <div className="notification-meta">
                  <span className="service-type">
                    {notification.serviceType}
                  </span>
                  <span className="days-until">
                    {notification.daysUntil < 0
                      ? `${Math.abs(notification.daysUntil)} days overdue`
                      : `Due in ${notification.daysUntil} days`}
                  </span>
                </div>
              </div>
              <button
                className="dismiss-btn"
                onClick={() => dismissNotification(notification._id)}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>

        <div className="notifications-actions">
          <button className="view-all-btn" onClick={handleViewRecommendations}>
            <FaEye />
            View All Recommendations
          </button>
          <button className="dismiss-all-btn" onClick={() => setVisible(false)}>
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationNotifications;
