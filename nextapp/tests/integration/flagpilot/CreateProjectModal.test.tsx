import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateProjectModal from "../../../components/flagpilot/CreateProjectModal";
import apiClient from "../../../app/lib/api-client";

jest.mock("../../../app/lib/api-client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("CreateProjectModal Integration Tests", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render when open is false", () => {
    const { container } = render(<CreateProjectModal {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders input fields and buttons when open is true", () => {
    render(<CreateProjectModal {...defaultProps} />);
    expect(screen.getByText("Create Project")).toBeInTheDocument();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/org id/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  test("validation error when project name is empty", async () => {
    render(<CreateProjectModal {...defaultProps} />);
    const createBtn = screen.getByRole("button", { name: "Create" });

    fireEvent.click(createBtn);

    expect(await screen.findByText("Project name is required")).toBeInTheDocument();
    expect(mockedApiClient.post).not.toHaveBeenCalled();
  });

  test("submits project form successfully and calls onCreated and onClose", async () => {
    const createdProject = { _id: "proj_1", name: "My New Project", apiKey: "fp_proj_123" };
    mockedApiClient.post.mockResolvedValueOnce({ data: createdProject });

    render(<CreateProjectModal {...defaultProps} />);

    const nameInput = screen.getByLabelText(/project name/i);
    fireEvent.change(nameInput, { target: { value: "  My New Project  " } });

    const createBtn = screen.getByRole("button", { name: "Create" });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith("/api/flagpilot/projects", {
        name: "My New Project",
        orgId: undefined,
      });
      expect(defaultProps.onCreated).toHaveBeenCalledWith(createdProject);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  test("displays error message when API creation fails", async () => {
    mockedApiClient.post.mockRejectedValueOnce({
      response: { data: { error: "Project name already exists" } },
    });

    render(<CreateProjectModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/project name/i), { target: { value: "Duplicate Proj" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Project name already exists")).toBeInTheDocument();
  });
});
