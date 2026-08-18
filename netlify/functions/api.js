const fetch = require("node-fetch");

exports.handler = async (event) => {
  // CORS / preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Method Not Allowed"
      })
    };
  }

  try {
    const API_KEY = process.env.PDSBOOST_API_KEY;
    const API_URL = "https://pdsboost.com/api/v2";

    if (!API_KEY) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "PDSBOOST_API_KEY is not configured in Netlify."
        })
      };
    }

    let body = {};

    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Invalid JSON request."
        })
      };
    }

    const action = body.action;

    const payload = {
      key: API_KEY,
      action: action
    };

    // ADD ORDER
    if (action === "add") {
      payload.service = body.service;
      payload.link = body.link;
      payload.quantity = body.quantity;

      if (!payload.service || !payload.link || !payload.quantity) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            error: "service, link and quantity are required."
          })
        };
      }
    }

    // ORDER STATUS
    if (action === "status") {
      payload.order = body.order;

      if (!payload.order) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            error: "Order ID is required."
          })
        };
      }
    }

    // SERVICES
    if (action === "services") {
      // nothing else needed
    }

    // BALANCE
    if (action === "balance") {
      // nothing else needed
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(payload).toString()
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        error: "PdsBoost returned an invalid response.",
        raw: text
      };
    }

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("PdsBoost proxy error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Proxy request failed.",
        details: error.message
      })
    };
  }
};
