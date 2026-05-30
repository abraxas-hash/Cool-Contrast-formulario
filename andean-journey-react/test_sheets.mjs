const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxyMwt1ywrb74yLEAfF2QNVf6wDGStAV6Qiu1nA5cgkJhEvFq8szcubM_RfpaFeZumbvQ/exec';

async function testFetch() {
    try {
        console.log("Fetching Google Sheets URL via GET...");
        const response = await fetch(GOOGLE_SHEETS_URL);
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response text start (first 500 chars):", text.substring(0, 500));
        
        try {
            const json = JSON.parse(text);
            console.log("Response JSON items:", json.length ? json.length : json);
            if (Array.isArray(json) && json.length > 0) {
                console.log("Sample item:", json[0]);
            }
        } catch (e) {
            console.log("Not valid JSON.");
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
testFetch();
