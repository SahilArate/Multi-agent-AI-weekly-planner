import asyncio
import websockets
import json

async def test():
    uri = "ws://localhost:8000/api/ws/plan"
    async with websockets.connect(uri) as ws:
        # Send planning request
        await ws.send(json.dumps({
            "goals": "Study DSA 2 hours daily, gym 3 times a week",
            "commitments": "Standup Monday-Friday 10am",
            "preferences": "Morning person, peak energy before noon"
        }))

        print("Connected! Watching agents work...\n")

        # Listen for all agent messages
        while True:
            msg = await ws.recv()
            data = json.loads(msg)
            
            icon = "🤔" if data["status"] == "thinking" else "✅" if data["status"] == "done" else "🎉"
            print(f"{icon} {data['agent']} — {data['message']}")
            
            if data["status"] in ["complete", "error"]:
                break

asyncio.run(test())