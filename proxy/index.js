const fetch = require('node-fetch');

module.exports = async function (context, req) {
    const targetUrl = `https://app.xiaofen.fun/api/${req.params.path || ''}`;

    const origin = req.headers.origin || req.headers.Origin;
    const allowedOrigins = [
        'https://xiaofen.z19.web.core.windows.net',
        'https://www.xiaofen.fun',
        'https://xiaofen.fun'
    ];

    let corsHeaders = {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'accept-platform, content-type, authorization',
        'Access-Control-Max-Age': '86400' // Cache for 1 day
    };

    if (allowedOrigins.includes(origin)) {
        corsHeaders['Access-Control-Allow-Origin'] = origin;
    } else {
        corsHeaders['Access-Control-Allow-Origin'] = 'https://xiaofen.z19.web.core.windows.net'; // default
    }


    // Handle pre-flight OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 204, // No Content
            headers: corsHeaders,
            body: null
        };
        return;
    }

    const headers = { ...req.headers };
    delete headers['host'];

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: req.rawBody,
            redirect: 'follow'
        });

        const responseBody = await response.buffer();

        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            responseHeaders[name] = value;
        });

        // Add/overwrite CORS headers to the actual response
        Object.assign(responseHeaders, corsHeaders);

        context.res = {
            status: response.status,
            headers: responseHeaders,
            body: responseBody
        };

    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 502, // Bad Gateway
            headers: corsHeaders,
            body: "Error fetching from target API."
        };
    }
};
