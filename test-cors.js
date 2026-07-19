fetch("https://api.supabase.com/v1/projects/abcd/database/query", {
    method: "OPTIONS",
    headers: {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST"
    }
}).then(r => console.log(r.headers.get("access-control-allow-origin"))).catch(console.error);
