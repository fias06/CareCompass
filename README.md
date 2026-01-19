**Inspiration**
In medical emergencies, time is critical. The closest hospital isn’t always the fastest or best option due to traffic, wait times, or capacity. We were inspired to build a tool that helps people make smarter, time-aware decisions when it matters most.

**What it does**
Care Compass helps users find the best medical facility for their situation. By analyzing real-time traffic, distance, ETAs, medical severity, and provider-reported wait times, Care Compass ranks nearby hospitals and clinics to guide users to the fastest path to care, not just the nearest one.

**How we built it**
We built CareCompass with a modular backend that integrates:

- Google Maps APIs for nearby place discovery, routing, and live traffic-based ETA
- A FastAPI backend to handle facility ranking and scoring
- A provider-side concept that allows hospitals to share live wait times
- A frontend experience powered by Athena AI designed for speed and clarity
- TTS & STT powered by ElevenLabs API for accessibility
- Our scoring system weighs ETA, distance, and wait times to produce a ranked list of options in real time.

**Challenges we ran into**
- Pipelining and synchronizing data from multiple APIs (places, routing, traffic, and wait times) in real time
- Navigating API implementation and permissions under tight time constraints
- Structuring a clean, scalable project file architecture under hackathon time constraints
- Configuring AI-based severity ranking and implementing scoring algorithm for recommendations
- Accomplishments that we're proud of
- Building a working end-to-end system under hackathon time limits
- Successfully integrating real-time traffic data into medical decision-making
- Designing a scalable architecture that supports both users and providers
- Creating a clear, intuitive experience for high-stress situations
- What we learned
- We learned how critical real-time data is in healthcare decision-making, how to work efficiently with external APIs, and how to design systems that work reliably in emergency situations.
**
What's next for Care Compass**
- Expand provider participation for real-time wait time reporting
- Support load balancing across facilities to reduce ER congestion
- Incorporate accessibility, insurance, and specialty filters
- Add symptom-based guidance to improve care before arrival


Devpost link: https://devpost.com/software/care-compass-zmpdn5
