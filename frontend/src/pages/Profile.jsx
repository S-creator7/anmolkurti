"use client"

import { useState, useContext, useEffect } from "react"
import { ShopContext } from "../context/ShopContext"
import axios from "axios"
import { toast } from "react-toastify"
import Title from "../components/Title"
import ScrollToTop from "../components/scrollToTop"
import { User, MapPin, Settings, Shield, Package, Heart, Bell, Phone, Mail, Edit3, Save, Camera } from "lucide-react"

const Profile = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    joinDate: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    preferences: {
      newsletter: false,
      smsUpdates: false,
      stockAlerts: true,
      emailNotifications: true,
    },
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      wishlistItems: 0,
    },
  })

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }
    fetchUserData()
  }, [token])

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { token },
      })
      if (response.data.success) {
        setUserData({
          ...response.data.user,
          stats: response.data.stats || { totalOrders: 12, totalSpent: 1250, wishlistItems: 8 },
          joinDate: response.data.user.joinDate || "2023-01-15",
        })
      }
      setLoading(false)
    } catch (error) {
      toast.error("Failed to load profile data")
      setLoading(false)
    }
  }

  const handleInputChange = (e, section = "main") => {
    const { name, value, type, checked } = e.target

    if (section === "preferences") {
      setUserData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: type === "checkbox" ? checked : value,
        },
      }))
    } else if (section === "address") {
      setUserData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }))
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await axios.put(`${backendUrl}/api/user/profile`, userData, { headers: { token } })
      if (response.data.success) {
        toast.success("Profile updated successfully")
        setIsEditing(false)
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "address", label: "Address", icon: MapPin },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFF5F7" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <ScrollToTop />
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <Title text1="MY" text2="PROFILE" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              <div className="h-20 bg-gradient-to-r from-gray-50 to-gray-100"></div>
              <div className="px-6 pb-6">
                <div className="relative -mt-10 mb-4">
                  <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                    {userData.avatar ? (
                      <img
                        src={userData.avatar || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-gray-600 text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="font-semibold text-lg text-gray-900">{userData.name || "User Name"}</h3>
                <p className="text-sm text-gray-500 mb-4">{userData.email}</p>
                <div className="text-xs text-gray-400">
                  Member since{" "}
                  {new Date(userData.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Account Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-medium">{userData.stats.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="font-medium">${userData.stats.totalSpent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Wishlist Items</span>
                  <span className="font-medium">{userData.stats.wishlistItems}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Package className="w-4 h-4 mr-3" />
                  Order History
                </button>
                <button
                  onClick={() => navigate("/wishlist")}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Heart className="w-4 h-4 mr-3" />
                  Wishlist
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Tab Navigation */}
              <div className="bg-white border-b border-gray-100">
                <nav className="flex bg-[#FFF0F5]">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-3 px-6 text-sm transition-colors relative ${
                          activeTab === tab.id
                            ? "text-gray-900 font-medium"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? "text-gray-900" : "text-gray-400"}`} />
                        {tab.label}
                        {activeTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Header with Edit Button */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                {/* Personal Information Tab */}
                {activeTab === "personal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={userData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                      <input
                        type="text"
                        value={new Date(userData.joinDate).toLocaleDateString()}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {activeTab === "address" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="street"
                        value={userData.address.street}
                        onChange={(e) => handleInputChange(e, "address")}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={userData.address.city}
                          onChange={(e) => handleInputChange(e, "address")}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                        <input
                          type="text"
                          name="state"
                          value={userData.address.state}
                          onChange={(e) => handleInputChange(e, "address")}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={userData.address.zipCode}
                          onChange={(e) => handleInputChange(e, "address")}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={userData.address.country}
                          onChange={(e) => handleInputChange(e, "address")}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Preferences</h3>
                      <div className="space-y-4">
                        {[
                          {
                            key: "newsletter",
                            label: "Newsletter Subscription",
                            desc: "Receive our weekly newsletter with latest updates and offers",
                          },
                          {
                            key: "emailNotifications",
                            label: "Email Notifications",
                            desc: "Get notified about order updates and account activity",
                          },
                          {
                            key: "smsUpdates",
                            label: "SMS Updates",
                            desc: "Receive text messages for important order updates",
                          },
                          {
                            key: "stockAlerts",
                            label: "Stock Alerts",
                            desc: "Get notified when items in your wishlist are back in stock",
                          },
                        ].map((pref) => (
                          <div
                            key={pref.key}
                            className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              name={pref.key}
                              checked={userData.preferences[pref.key]}
                              onChange={(e) => handleInputChange(e, "preferences")}
                              disabled={!isEditing}
                              className="mt-1 w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 disabled:opacity-50"
                            />
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-900">{pref.label}</label>
                              <p className="text-sm text-gray-500 mt-1">{pref.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <Shield className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800">Security Settings</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            Manage your account security and password settings.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Change Password</p>
                            <p className="text-sm text-gray-500">Update your account password</p>
                          </div>
                        </div>
                        <span className="text-gray-400">→</span>
                      </button>

                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                          </div>
                        </div>
                        <span className="text-gray-400">→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile