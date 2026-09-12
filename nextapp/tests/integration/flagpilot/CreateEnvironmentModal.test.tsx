import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateEnvironmentModal from "../../../components/flagpilot/CreateEnvironmentModal";
import apiClient from "../../../app/lib/api-client";

jest.mock("../../../app/lib/api-client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("CreateEnvironmentModal Integration Tests", () => {
  const defaultProps = {
    open: true,
    projectId: "proj_123",
    onClose: jest.fn(),
    onCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render when open is false", () => {
    const { container } = render(<CreateEnvironmentModal {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  test("validation error when environment name is empty", async () => {
    render(<CreateEnvironmentModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Environment name is required")).toBeInTheDocument();
    expect(mockedApiClient.post).not.toHaveBeenCalled();
  });

  test("submits environment form successfully and calls onCreated", async () => {
    const createdEnv = { _id: "env_1", name: "Production", projectId: "proj_123" };
    mockedApiClient.post.mockResolvedValueOnce({ data: createdEnv });

    render(<CreateEnvironmentModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/environment name/i), { target: { value: "Production" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith("/api/flagpilot/environments", {
        name: "Production",
        projectId: "proj_123",
      });
      expect(defaultProps.onCreated).toHaveBeenCalledWith(createdEnv);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  test("displays error message on server failure", async () => {
    mockedApiClient.post.mockRejectedValueOnce({
      response: { data: { error: "Environment already exists" } },
    });

    render(<CreateEnvironmentModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/environment name/i), { target: { value: "Duplicate" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Environment already exists")).toBeInTheDocument();
  });
});
