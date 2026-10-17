import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlagpilotIndex from "../../../app/flagpilot/page";
import apiClient from "../../../app/lib/api-client";

jest.mock("../../../app/lib/api-client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("FlagpilotIndex Projects Page Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders empty state when no projects exist", async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: [] });

    render(<FlagpilotIndex />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    expect(
      await screen.findByText('No projects yet. Click "Create Project" to add one.')
    ).toBeInTheDocument();
  });

  test("fetches and displays list of projects", async () => {
    const projects = [
      { _id: "p1", name: "Project Alpha", apiKey: "fp_proj_alpha" },
      { _id: "p2", name: "Project Beta", apiKey: "fp_proj_beta" },
    ];
    mockedApiClient.get.mockResolvedValueOnce({ data: projects });

    render(<FlagpilotIndex />);

    expect(await screen.findByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByText("Project Beta")).toBeInTheDocument();
    expect(screen.getByText("API key: fp_proj_alpha")).toBeInTheDocument();
  });

  test("opens CreateProjectModal when Create Project button is clicked", async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: [] });

    render(<FlagpilotIndex />);
    await screen.findByText('No projects yet. Click "Create Project" to add one.');

    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));

    expect(screen.getByRole("heading", { name: "Create Project" })).toBeInTheDocument();
  });
});
