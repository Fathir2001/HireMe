import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBed,
  FaBolt,
  FaBrain,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaCog,
  FaExclamationTriangle,
  FaHome,
  FaLeaf,
  FaLightbulb,
  FaShieldAlt,
  FaTimes,
  FaTools,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./aiRecommendations.css";

interface Recommendation {
  _id: string;
  title: string;
  description: string;
  serviceType: string;
  recommendationType: string;
  priority: string;
  confidenceScore: number;
  daysUntil: number;
  isOverdue: boolean;
  estimatedCost?: {
    min: number;
    max: number;
  };
  reasons?: string[];
}

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, [filter]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filter !== "all") {
        if (["urgent", "high", "medium", "low"].includes(filter)) {
          params.append("priority", filter);
        } else {
          params.append("type", filter);
        }
      }

      const response = await fetch(
        `http://localhost:5000/api/ai-recommendations?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        console.error("Failed to fetch recommendations");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/ai-recommendations/generate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ forceRegenerate: true }),
        }
      );

      if (response.ok) {
        await fetchRecommendations();
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleRecommendationAction = async (
    recommendationId: string,
    action: string,
    additionalData: Record<string, unknown> = {}
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/ai-recommendations/${recommendationId}/action`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            ...additionalData,
          }),
        }
      );

      if (response.ok) {
        await fetchRecommendations();
      }
    } catch (error) {
      console.error("Error handling recommendation action:", error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <FaExclamationTriangle className="priority-icon urgent" />;
      case "high":
        return <FaBolt className="priority-icon high" />;
      case "medium":
        return <FaClock className="priority-icon medium" />;
      case "low":
        return <FaLeaf className="priority-icon low" />;
      default:
        return <FaClock className="priority-icon medium" />;
    }
  };

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case "predictive_maintenance":
        return <FaBrain className="type-icon predictive" />;
      case "seasonal_recommendation":
        return <FaLeaf className="type-icon seasonal" />;
      case "usage_based":
        return <FaTools className="type-icon usage" />;
      case "emergency_prevention":
        return <FaShieldAlt className="type-icon emergency" />;
      default:
        return <FaLightbulb className="type-icon default" />;
    }
  };

  const formatDaysUntil = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  };

  const getRecommendationTypeText = (type: string) => {
    const types: Record<string, string> = {
      predictive_maintenance: "Predictive Maintenance",
      seasonal_recommendation: "Seasonal Service",
      usage_based: "Usage-Based",
      emergency_prevention: "Emergency Prevention",
    };
    return types[type] || "General Recommendation";
  };

  if (loading) {
    return (
      <div className="ai-recommendations-loading">
        <div className="loading-spinner"></div>
        <p>Loading your personalized recommendations...</p>
      </div>
    );
  }

  return (
    <div className="ai-recommendations-container">
      {/* Navigation Bar */}
      <nav className="ai-nav-bar">
        <div className="ai-nav-left">
          <button
            className="ai-nav-back-btn"
            onClick={() => navigate("/book-service")}
          >
            <FaArrowLeft /> Back to Book Service
          </button>
        </div>
        <div className="ai-nav-center">
          <h1>HireMe AI</h1>
        </div>
        <div className="ai-nav-right">
          <button
            className="ai-nav-preferences-btn"
            onClick={() => navigate("/service-needer/ai-preferences")}
          >
            <FaCog /> AI Preferences
          </button>
          <button
            className="ai-nav-home-btn"
            onClick={() => navigate("/service-needer/home")}
          >
            <FaHome /> Home
          </button>
        </div>
      </nav>

      <div className="ai-recommendations-header">
        <div className="header-content">
          <h2>
            <FaBrain className="header-icon" />
            AI-Powered Service Recommendations
          </h2>
          <p>
            Smart suggestions based on your home's needs and service history
          </p>
        </div>

        <div className="header-actions">
          <button
            className="generate-btn"
            onClick={generateNewRecommendations}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate New"}
          </button>
        </div>
      </div>

      <div className="recommendations-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === "urgent" ? "active" : ""}`}
          onClick={() => setFilter("urgent")}
        >
          Urgent
        </button>
        <button
          className={`filter-btn ${
            filter === "predictive_maintenance" ? "active" : ""
          }`}
          onClick={() => setFilter("predictive_maintenance")}
        >
          Predictive
        </button>
        <button
          className={`filter-btn ${
            filter === "seasonal_recommendation" ? "active" : ""
          }`}
          onClick={() => setFilter("seasonal_recommendation")}
        >
          Seasonal
        </button>
        <button
          className={`filter-btn ${
            filter === "emergency_prevention" ? "active" : ""
          }`}
          onClick={() => setFilter("emergency_prevention")}
        >
          Prevention
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <FaLightbulb className="no-recommendations-icon" />
          <h3>No recommendations available</h3>
          <p>
            We'll analyze your service history and generate personalized
            recommendations soon.
          </p>
          <button className="generate-btn" onClick={generateNewRecommendations}>
            Generate Recommendations
          </button>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation._id}
              className={`recommendation-card ${recommendation.priority}`}
            >
              <div className="card-header">
                <div className="card-title">
                  {getRecommendationTypeIcon(recommendation.recommendationType)}
                  <div>
                    <h3>{recommendation.title}</h3>
                    <span className="recommendation-type">
                      {getRecommendationTypeText(
                        recommendation.recommendationType
                      )}
                    </span>
                  </div>
                </div>
                <div className="card-priority">
                  {getPriorityIcon(recommendation.priority)}
                </div>
              </div>

              <div className="card-content">
                <p className="description">{recommendation.description}</p>

                <div className="recommendation-details">
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>{formatDaysUntil(recommendation.daysUntil)}</span>
                  </div>

                  <div className="detail-item">
                    <FaBrain />
                    <span>
                      Confidence:{" "}
                      {Math.round(recommendation.confidenceScore * 100)}%
                    </span>
                  </div>

                  {recommendation.estimatedCost && (
                    <div className="detail-item cost">
                      <span>
                        Est. Cost: ${recommendation.estimatedCost.min} - $
                        {recommendation.estimatedCost.max}
                      </span>
                    </div>
                  )}
                </div>

                {recommendation.reasons &&
                  recommendation.reasons.length > 0 && (
                    <div className="recommendation-reasons">
                      <h4>Why we recommend this:</h4>
                      <ul>
                        {recommendation.reasons
                          .slice(0, 2)
                          .map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                      </ul>
                    </div>
                  )}

                {recommendation.isOverdue && (
                  <div className="overdue-badge">
                    <FaExclamationTriangle />
                    Overdue
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="action-btn primary"
                  onClick={() => {
                    handleRecommendationAction(recommendation._id, "accept");
                    // In a real app, this would redirect to booking
                    window.location.href = `/book-service?type=${recommendation.serviceType}&recommendationId=${recommendation._id}`;
                  }}
                >
                  <FaCheck />
                  Book Service
                  <FaArrowRight />
                </button>

                <button
                  className="action-btn secondary"
                  onClick={() => {
                    const snoozeUntil = new Date();
                    snoozeUntil.setDate(snoozeUntil.getDate() + 7);
                    handleRecommendationAction(recommendation._id, "snooze", {
                      snoozeUntil: snoozeUntil.toISOString(),
                    });
                  }}
                >
                  <FaBed />
                  Remind Later
                </button>

                <button
                  className="action-btn dismiss"
                  onClick={() => {
                    const reason = prompt(
                      "Why are you dismissing this recommendation? (optional)"
                    );
                    handleRecommendationAction(recommendation._id, "dismiss", {
                      reason,
                    });
                  }}
                >
                  <FaTimes />
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
