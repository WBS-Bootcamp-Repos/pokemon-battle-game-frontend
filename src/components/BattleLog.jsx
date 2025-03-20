/**
 * BattleLog Component
 * 
 * Displays battle messages in a scrollable container with automatic scrolling
 * to the most recent message. Supports different message types with color coding
 * and has a GBA-inspired visual style.
 * 
 * @param {Array} messages - Array of message strings or objects with text and type properties
 */
import React, { useEffect, useRef } from "react";

const BattleLog = ({ messages = [] }) => {
  const logContainerRef = useRef(null);

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages]);

  /**
   * Extracts the displayable text from different message formats
   * @param {string|Object} message - Message to format
   * @returns {string} Formatted text to display
   */
  const formatMessage = (message) => {
    // If message is just a string
    if (typeof message === "string") {
      return message;
    }
    // If message is an object with text property
    else if (message && message.text) {
      return message.text;
    }
    // Fallback
    return String(message);
  };

  /**
   * Determines CSS class for message color based on type
   * @param {string|Object} message - Message to style
   * @returns {string} CSS class for text color
   */
  const getMessageColor = (message) => {
    if (typeof message === "string") {
      return "text-gray-800"; // Default for string messages
    }

    // For object messages with type
    switch (message.type) {
      case "player":
        return "text-blue-800";
      case "enemy":
        return "text-red-800";
      case "system":
        return "text-green-800";
      case "critical":
        return "text-red-600 font-bold";
      case "superEffective":
        return "text-orange-600";
      case "notEffective":
        return "text-gray-600";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div
      ref={logContainerRef}
      className="bg-[#f8f8f8] border-4 border-[#383030] rounded-lg p-3 shadow-md h-40 overflow-y-auto font-pixel text-sm relative"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #f8f8f8 0%, #f8f8f8 90%, #e8e8e8 100%)",
      }}
    >
      {/* GBA-style decorative corner notch */}
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#383030] rounded-tl-lg"></div>

      {messages && messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div key={index} className={`message ${getMessageColor(message)}`}>
              {formatMessage(message)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          Battle will begin soon...
        </p>
      )}
    </div>
  );
};

export default BattleLog;