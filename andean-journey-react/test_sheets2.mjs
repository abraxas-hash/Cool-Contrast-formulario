const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxyMwt1ywrb74yLEAfF2QNVf6wDGStAV6Qiu1nA5cgkJhEvFq8szcubM_RfpaFeZumbvQ/exec';

async function testFetch() {
    const response = await fetch(GOOGLE_SHEETS_URL);
    const json = await response.json();
    console.log("Root keys:", Object.keys(json));
}
testFetch();
