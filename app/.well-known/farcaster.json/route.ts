export async function GET() {

    const config = {
        accountAssociation: {
            header: "eyJmaWQiOjg5MTkxNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDRmYzg1YjUzN2FkYzE4RmYzNTRhMzJDNkUxM0JCRGNEZDk0YTZEMDEifQ",
            payload: "eyJkb21haW4iOiJhc2NpaWNhc3QudmVyY2VsLmFwcCJ9",
            signature: "MHhlMDlkNTE3YmU2NTExYWUwZDkyYmQxMWI3ZGNlZGQzY2FhNjhjZTkxNTFmNDg2OGRkMjgyMGI0YWZiNjdjZGVjMTY3MWNmMmI1YzMyYTk0MDllNTc4NWM5MjUzYjYxNzFjMTdkOTY2YWNiNTM5M2FhMWFjOGU2ZjEzNjEyZWEwOTFi"
        },
        frame: {
            version: "1",
            name: "Ascii Art Animation",
            iconUrl: "https://asciicast.vercel.app/icon.jpg",
            homeUrl: "https://asciicast.vercel.app",
            imageUrl: "https://asciicast.vercel.app/og-image.jpg",
            buttonTitle: "Mint ASCII Art",
            splashImageUrl: "https://asciicast.vercel.app/splash.svg",
            splashBackgroundColor: "#17101f",
            webhookUrl: "https://asciicast.vercel.app/api/webhook"
        }
    };

    return Response.json(config);
}