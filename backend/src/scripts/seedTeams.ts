import { TeamModel, Team, TeamMember } from "../models/teamModel";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "";

async function seedTeams() {
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing teams
    const deleteResult = await TeamModel.deleteMany({});
    console.log("Cleared existing teams:", deleteResult.deletedCount);

    // Generate availability for the next 30 days
    const availability = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      availability.push({
        date: date,
        available: true,
      });
    }

    console.log("Generated availability for", availability.length, "days");

    // Create sample team
    const sampleTeam: Partial<Team> = {
      teamId: "team-1",
      members: [
        {
          employeeId: "emp-1",
          name: "Alice",
          role: "Developer",
          availability: availability.map((a) => ({ ...a })),
        },
        {
          employeeId: "emp-2",
          name: "Bob",
          role: "Designer",
          availability: availability.map((a) => ({ ...a })),
        },
        {
          employeeId: "emp-3",
          name: "Charlie",
          role: "Manager",
          availability: availability.map((a) => ({ ...a })),
        },
      ] as TeamMember[],
    };

    // Save the sample team
    console.log(
      "Creating team with data:",
      JSON.stringify(sampleTeam, null, 2)
    );
    const team = new TeamModel(sampleTeam);
    const savedTeam = await team.save();

    console.log("Sample team created successfully!");
    console.log("Team ID:", savedTeam.teamId);
    console.log(
      "Team members:",
      savedTeam.members.map((m) => `${m.name} (${m.role})`)
    );

    // Verify the team was saved by querying it back
    const foundTeam = await TeamModel.findOne({ teamId: "team-1" });
    console.log("Verified team exists in database:", !!foundTeam);

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error seeding teams:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  console.log("Running seed script...");
  seedTeams();
}

export { seedTeams };
