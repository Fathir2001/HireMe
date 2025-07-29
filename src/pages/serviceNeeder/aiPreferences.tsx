import { useCallback, useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBell,
  FaBrain,
  FaCog,
  FaDollarSign,
  FaHome,
  FaSave,
  FaTools,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./aiPreferences.css";

interface UserPreferences {
  servicePreferences: {
    preferredServices: Array<{
      serviceType: string;
      frequency: string;
      importance: number;
    }>;
    budgetRanges: {
      emergency: { min: number; max: number };
      routine: { min: number; max: number };
      upgrade: { min: number; max: number };
    };
    timePreferences: {
      preferredDays: string[];
      preferredTimes: string[];
      advanceNotice: number;
    };
    communicationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
      frequency: string;
    };
  };
  homeProfile: {
    homeType: string;
    homeAge: number;
    homeSize: {
      squareFeet: number;
      bedrooms: number;
      bathrooms: number;
    };
    appliances: Array<{
      type: string;
      brand: string;
      installDate: string;
      lastMaintenance: string;
    }>;
    specialFeatures: string[];
    location: {
      zipCode: string;
      climate: string;
      environment: string;
    };
  };
  behaviorProfile: {
    serviceFrequency: string;
    maintenanceStyle: string;
    riskTolerance: string;
    techSavviness: string;
    pricesensitivity: string;
  };
}

const AIPreferences = () => {
  const getDefaultPreferences = (): UserPreferences => ({
    servicePreferences: {
      preferredServices: [],
      budgetRanges: {
        emergency: { min: 0, max: 1000 },
        routine: { min: 0, max: 500 },
        upgrade: { min: 0, max: 2000 },
      },
      timePreferences: {
        preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        preferredTimes: ["morning", "afternoon"],
        advanceNotice: 7,
      },
      communicationPreferences: {
        email: true,
        sms: false,
        push: true,
        frequency: "weekly",
      },
    },
    homeProfile: {
      homeType: "house",
      homeAge: 10,
      homeSize: {
        squareFeet: 1500,
        bedrooms: 3,
        bathrooms: 2,
      },
      appliances: [],
      specialFeatures: [],
      location: {
        zipCode: "",
        climate: "temperate",
        environment: "suburban",
      },
    },
    behaviorProfile: {
      serviceFrequency: "moderate",
      maintenanceStyle: "reactive",
      riskTolerance: "medium",
      techSavviness: "medium",
      pricesensitivity: "medium",
    },
  });

  const [preferences, setPreferences] = useState<UserPreferences>(
    getDefaultPreferences()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("services");
  const navigate = useNavigate();

  const serviceTypes = [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Carpentry",
    "Painting",
    "HVAC",
    "Landscaping",
    "Pest Control",
    "Appliance Repair",
    "Home Security",
    "Roofing",
    "Flooring",
  ];

  const frequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semi-annually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
    { value: "as-needed", label: "As Needed" },
  ];

  const fetchPreferences = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/ai-recommendations/preferences",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          // Merge API preferences with defaults to ensure all properties exist
          const defaultPrefs = getDefaultPreferences();
          const mergedPreferences: UserPreferences = {
            servicePreferences: {
              ...defaultPrefs.servicePreferences,
              ...data.preferences.servicePreferences,
              budgetRanges: {
                ...defaultPrefs.servicePreferences.budgetRanges,
                ...data.preferences.servicePreferences?.budgetRanges,
              },
              timePreferences: {
                ...defaultPrefs.servicePreferences.timePreferences,
                ...data.preferences.servicePreferences?.timePreferences,
              },
              communicationPreferences: {
                ...defaultPrefs.servicePreferences.communicationPreferences,
                ...data.preferences.servicePreferences
                  ?.communicationPreferences,
              },
            },
            homeProfile: {
              ...defaultPrefs.homeProfile,
              ...data.preferences.homeProfile,
              homeSize: {
                ...defaultPrefs.homeProfile.homeSize,
                ...data.preferences.homeProfile?.homeSize,
              },
              location: {
                ...defaultPrefs.homeProfile.location,
                ...data.preferences.homeProfile?.location,
              },
            },
            behaviorProfile: {
              ...defaultPrefs.behaviorProfile,
              ...data.preferences.behaviorProfile,
            },
          };
          setPreferences(mergedPreferences);
        } else {
          // Set default preferences
          setPreferences(getDefaultPreferences());
        }
      } else {
        console.error("Failed to fetch preferences");
        setPreferences(getDefaultPreferences());
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setPreferences(getDefaultPreferences());
      setPreferences(getDefaultPreferences());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/ai-recommendations/preferences",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferences),
        }
      );

      if (response.ok) {
        alert("Preferences saved successfully!");
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("Error response:", errorData);
        alert(
          `Failed to save preferences: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Network error";
      alert(`Failed to save preferences: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const updateServicePreference = (
    serviceType: string,
    field: string,
    value: unknown
  ) => {
    if (!preferences) return;

    const updatedServices = [
      ...preferences.servicePreferences.preferredServices,
    ];
    const existingIndex = updatedServices.findIndex(
      (s) => s.serviceType === serviceType
    );

    if (existingIndex >= 0) {
      updatedServices[existingIndex] = {
        ...updatedServices[existingIndex],
        [field]: value,
      };
    } else {
      updatedServices.push({
        serviceType,
        frequency: "as-needed",
        importance: 3,
        [field]: value,
      });
    }

    setPreferences({
      ...preferences,
      servicePreferences: {
        ...preferences.servicePreferences,
        preferredServices: updatedServices,
      },
    });
  };

  const getServicePreference = (serviceType: string, field: string) => {
    if (!preferences) return field === "importance" ? 3 : "as-needed";

    const service = preferences.servicePreferences.preferredServices.find(
      (s) => s.serviceType === serviceType
    );

    return service
      ? service[field as keyof typeof service]
      : field === "importance"
      ? 3
      : "as-needed";
  };

  if (loading) {
    return (
      <div className="ai-preferences-loading">
        <div className="loading-spinner"></div>
        <p>Loading your preferences...</p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="ai-preferences-error">
        <p>Failed to load preferences. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="ai-preferences-container">
      {/* Navigation Bar */}
      <nav className="ai-nav-bar">
        <div className="ai-nav-left">
          <button
            className="ai-nav-back-btn"
            onClick={() => navigate("/service-needer/ai-recommendations")}
          >
            <FaArrowLeft /> Back to Recommendations
          </button>
        </div>
        <div className="ai-nav-center">
          <h1>HireMe AI Settings</h1>
        </div>
        <div className="ai-nav-right">
          <button
            className="ai-nav-home-btn"
            onClick={() => navigate("/book-service")}
          >
            <FaHome /> Book Service
          </button>
        </div>
      </nav>

      <div className="preferences-header">
        <h2>
          <FaCog className="header-icon" />
          AI Recommendation Preferences
        </h2>
        <p>Customize your AI-powered service recommendations</p>
      </div>

      <div className="preferences-tabs">
        <button
          className={`tab-btn ${activeTab === "services" ? "active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          <FaTools />
          Services
        </button>
        <button
          className={`tab-btn ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          <FaHome />
          Home Profile
        </button>
        <button
          className={`tab-btn ${activeTab === "behavior" ? "active" : ""}`}
          onClick={() => setActiveTab("behavior")}
        >
          <FaBrain />
          Behavior
        </button>
        <button
          className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          <FaBell />
          Notifications
        </button>
      </div>

      <div className="preferences-content">
        {activeTab === "services" && (
          <div className="tab-content">
            <div className="section">
              <h3>
                <FaTools className="section-icon" />
                Service Preferences
              </h3>
              <p>Set your preferences for different service types</p>

              <div className="services-grid">
                {serviceTypes.map((serviceType) => (
                  <div key={serviceType} className="service-preference-card">
                    <h4>{serviceType}</h4>

                    <div className="preference-row">
                      <label>Frequency:</label>
                      <select
                        value={
                          getServicePreference(
                            serviceType,
                            "frequency"
                          ) as string
                        }
                        onChange={(e) =>
                          updateServicePreference(
                            serviceType,
                            "frequency",
                            e.target.value
                          )
                        }
                      >
                        {frequencies.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="preference-row">
                      <label>Importance:</label>
                      <div className="importance-slider">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={
                            getServicePreference(
                              serviceType,
                              "importance"
                            ) as number
                          }
                          onChange={(e) =>
                            updateServicePreference(
                              serviceType,
                              "importance",
                              parseInt(e.target.value)
                            )
                          }
                        />
                        <span>
                          {getServicePreference(serviceType, "importance")}/5
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h3>
                <FaDollarSign className="section-icon" />
                Budget Ranges
              </h3>

              <div className="budget-grid">
                <div className="budget-card">
                  <h4>Emergency Services</h4>
                  <div className="budget-inputs">
                    <input
                      type="number"
                      placeholder="Min $"
                      value={
                        preferences.servicePreferences.budgetRanges.emergency
                          .min
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          servicePreferences: {
                            ...preferences.servicePreferences,
                            budgetRanges: {
                              ...preferences.servicePreferences.budgetRanges,
                              emergency: {
                                ...preferences.servicePreferences.budgetRanges
                                  .emergency,
                                min: parseInt(e.target.value) || 0,
                              },
                            },
                          },
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={
                        preferences.servicePreferences.budgetRanges.emergency
                          .max
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          servicePreferences: {
                            ...preferences.servicePreferences,
                            budgetRanges: {
                              ...preferences.servicePreferences.budgetRanges,
                              emergency: {
                                ...preferences.servicePreferences.budgetRanges
                                  .emergency,
                                max: parseInt(e.target.value) || 0,
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="budget-card">
                  <h4>Routine Maintenance</h4>
                  <div className="budget-inputs">
                    <input
                      type="number"
                      placeholder="Min $"
                      value={
                        preferences.servicePreferences.budgetRanges.routine.min
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          servicePreferences: {
                            ...preferences.servicePreferences,
                            budgetRanges: {
                              ...preferences.servicePreferences.budgetRanges,
                              routine: {
                                ...preferences.servicePreferences.budgetRanges
                                  .routine,
                                min: parseInt(e.target.value) || 0,
                              },
                            },
                          },
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={
                        preferences.servicePreferences.budgetRanges.routine.max
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          servicePreferences: {
                            ...preferences.servicePreferences,
                            budgetRanges: {
                              ...preferences.servicePreferences.budgetRanges,
                              routine: {
                                ...preferences.servicePreferences.budgetRanges
                                  .routine,
                                max: parseInt(e.target.value) || 0,
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="budget-card">
                  <h4>Upgrades & Improvements</h4>
                  <div className="budget-inputs">
                    <input
                      type="number"
                      placeholder="Min $"
                      value={
                        preferences.servicePreferences.budgetRanges.upgrade.min
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          servicePreferences: {
                            ...preferences.servicePreferences,
                            budgetRanges: {
                              ...preferences.servicePreferences.budgetRanges,
                              upgrade: {
                                ...preferences.servicePreferences.budgetRanges
                                  .upgrade,
                                min: parseInt(e.target.value) || 0,
                              },
                            },
                          },
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={
                        preferences.servicePreferences.budgetRanges.upgrade.max
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          servicePreferences: {
                            ...preferences.servicePreferences,
                            budgetRanges: {
                              ...preferences.servicePreferences.budgetRanges,
                              upgrade: {
                                ...preferences.servicePreferences.budgetRanges
                                  .upgrade,
                                max: parseInt(e.target.value) || 0,
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "home" && (
          <div className="tab-content">
            <div className="section">
              <h3>
                <FaHome className="section-icon" />
                Home Information
              </h3>

              <div className="home-info-grid">
                <div className="info-card">
                  <label>Home Type:</label>
                  <select
                    value={preferences.homeProfile.homeType}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        homeProfile: {
                          ...preferences.homeProfile,
                          homeType: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="info-card">
                  <label>Home Age (years):</label>
                  <input
                    type="number"
                    value={preferences.homeProfile.homeAge}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        homeProfile: {
                          ...preferences.homeProfile,
                          homeAge: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>

                <div className="info-card">
                  <label>Square Feet:</label>
                  <input
                    type="number"
                    value={preferences.homeProfile.homeSize.squareFeet}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        homeProfile: {
                          ...preferences.homeProfile,
                          homeSize: {
                            ...preferences.homeProfile.homeSize,
                            squareFeet: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="info-card">
                  <label>Bedrooms:</label>
                  <input
                    type="number"
                    value={preferences.homeProfile.homeSize.bedrooms}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        homeProfile: {
                          ...preferences.homeProfile,
                          homeSize: {
                            ...preferences.homeProfile.homeSize,
                            bedrooms: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="info-card">
                  <label>Bathrooms:</label>
                  <input
                    type="number"
                    value={preferences.homeProfile.homeSize.bathrooms}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        homeProfile: {
                          ...preferences.homeProfile,
                          homeSize: {
                            ...preferences.homeProfile.homeSize,
                            bathrooms: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="info-card">
                  <label>Climate:</label>
                  <select
                    value={preferences.homeProfile.location.climate}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        homeProfile: {
                          ...preferences.homeProfile,
                          location: {
                            ...preferences.homeProfile.location,
                            climate: e.target.value,
                          },
                        },
                      })
                    }
                  >
                    <option value="tropical">Tropical</option>
                    <option value="dry">Dry</option>
                    <option value="temperate">Temperate</option>
                    <option value="continental">Continental</option>
                    <option value="polar">Polar</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "behavior" && (
          <div className="tab-content">
            <div className="section">
              <h3>
                <FaBrain className="section-icon" />
                Maintenance Style
              </h3>

              <div className="behavior-options">
                <div className="behavior-card">
                  <h4>Service Frequency</h4>
                  <select
                    value={preferences.behaviorProfile.serviceFrequency}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        behaviorProfile: {
                          ...preferences.behaviorProfile,
                          serviceFrequency: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="very_low">Very Low</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>

                <div className="behavior-card">
                  <h4>Maintenance Style</h4>
                  <select
                    value={preferences.behaviorProfile.maintenanceStyle}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        behaviorProfile: {
                          ...preferences.behaviorProfile,
                          maintenanceStyle: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="reactive">Reactive (fix when broken)</option>
                    <option value="proactive">
                      Proactive (planned maintenance)
                    </option>
                    <option value="preventive">
                      Preventive (avoid problems)
                    </option>
                  </select>
                </div>

                <div className="behavior-card">
                  <h4>Risk Tolerance</h4>
                  <select
                    value={preferences.behaviorProfile.riskTolerance}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        behaviorProfile: {
                          ...preferences.behaviorProfile,
                          riskTolerance: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="low">Low (prefer safety)</option>
                    <option value="medium">Medium (balanced)</option>
                    <option value="high">High (willing to wait)</option>
                  </select>
                </div>

                <div className="behavior-card">
                  <h4>Price Sensitivity</h4>
                  <select
                    value={preferences.behaviorProfile.pricesensitivity}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        behaviorProfile: {
                          ...preferences.behaviorProfile,
                          pricesensitivity: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="low">Low (quality focused)</option>
                    <option value="medium">Medium (balanced)</option>
                    <option value="high">High (budget conscious)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="tab-content">
            <div className="section">
              <h3>
                <FaBell className="section-icon" />
                Communication Preferences
              </h3>

              <div className="notification-options">
                <div className="notification-card">
                  <h4>Notification Methods</h4>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          preferences.servicePreferences
                            .communicationPreferences.email
                        }
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            servicePreferences: {
                              ...preferences.servicePreferences,
                              communicationPreferences: {
                                ...preferences.servicePreferences
                                  .communicationPreferences,
                                email: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                      Email Notifications
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          preferences.servicePreferences
                            .communicationPreferences.push
                        }
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            servicePreferences: {
                              ...preferences.servicePreferences,
                              communicationPreferences: {
                                ...preferences.servicePreferences
                                  .communicationPreferences,
                                push: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                      Push Notifications
                    </label>
                  </div>
                </div>

                <div className="notification-card">
                  <h4>Notification Frequency</h4>
                  <select
                    value={
                      preferences.servicePreferences.communicationPreferences
                        .frequency
                    }
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        servicePreferences: {
                          ...preferences.servicePreferences,
                          communicationPreferences: {
                            ...preferences.servicePreferences
                              .communicationPreferences,
                            frequency: e.target.value,
                          },
                        },
                      })
                    }
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="notification-card">
                  <h4>Advance Notice</h4>
                  <div className="advance-notice">
                    <input
                      type="number"
                      value={
                        preferences.servicePreferences.timePreferences
                          .advanceNotice
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          servicePreferences: {
                            ...preferences.servicePreferences,
                            timePreferences: {
                              ...preferences.servicePreferences.timePreferences,
                              advanceNotice: parseInt(e.target.value) || 7,
                            },
                          },
                        })
                      }
                    />
                    <span>days in advance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="preferences-actions">
        <button
          className="save-btn"
          onClick={savePreferences}
          disabled={saving}
        >
          <FaSave />
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
};

export default AIPreferences;
