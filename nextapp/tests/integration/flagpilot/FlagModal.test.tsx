import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlagModal from "../../../components/flagpilot/FlagModal";
import apiClient from "../../../app/lib/api-client";

jest.mock("../../../app/lib/api-client");
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("FlagModal Integration Tests", () => {
  const defaultProps = {
    open: true,
    projectId: "proj_123",
    onClose: jest.fn(),
    onSaved: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render when open is false", () => {
    const { container } = render(<FlagModal {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  test("validation error when submitting without flag key", async () => {
    render(<FlagModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Flag key is required")).toBeInTheDocument();
  });

  test("validation error when projectId is missing", async () => {
    render(<FlagModal {...defaultProps} projectId="" />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Project ID is missing")).toBeInTheDocument();
  });

  test("validation error when fewer than 2 variants remain", async () => {
    render(<FlagModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/flag key/i), { target: { value: "my_flag" } });

    // Try removing a variant when there are 2 variants (remove button should be disabled)
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    expect(removeButtons[0]).toBeDisabled();
  });

  test("validation error when variant key is blank", async () => {
    render(<FlagModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/flag key/i), { target: { value: "my_flag" } });

    const variantKeyInputs = screen.getAllByPlaceholderText("variant key");
    fireEvent.change(variantKeyInputs[0], { target: { value: "" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Each variant needs a key")).toBeInTheDocument();
  });

  test("validation error when variant keys are duplicated", async () => {
    render(<FlagModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/flag key/i), { target: { value: "my_flag" } });

    const variantKeyInputs = screen.getAllByPlaceholderText("variant key");
    fireEvent.change(variantKeyInputs[0], { target: { value: "control" } });
    fireEvent.change(variantKeyInputs[1], { target: { value: "control" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Variant keys must be unique")).toBeInTheDocument();
  });

  test("typing display name does NOT auto-overwrite custom flag key", () => {
    render(<FlagModal {...defaultProps} />);
    const keyInput = screen.getByLabelText(/flag key/i);
    const displayNameInput = screen.getByLabelText(/display name/i);

    fireEvent.change(keyInput, { target: { value: "custom_key_123" } });
    fireEvent.change(displayNameInput, { target: { value: "New Display Title" } });

    expect((keyInput as HTMLInputElement).value).toBe("custom_key_123");
  });

  test("adds a new variant when Add Variant is clicked", () => {
    render(<FlagModal {...defaultProps} />);
    expect(screen.getAllByPlaceholderText("variant key")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Add Variant" }));

    expect(screen.getAllByPlaceholderText("variant key")).toHaveLength(3);
  });

  test("successfully creates a new flag with parsed JSON and boolean variant values", async () => {
    const createdFlag = { _id: "flag_1", key: "new_feature_flag" };
    mockedApiClient.post.mockResolvedValueOnce({ data: createdFlag });

    render(<FlagModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/flag key/i), { target: { value: "new_feature_flag" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Test description" } });

    const valueInputs = screen.getAllByPlaceholderText(/JSON or primitive/i);
    fireEvent.change(valueInputs[0], { target: { value: "false" } });
    fireEvent.change(valueInputs[1], { target: { value: '{"theme":"dark"}' } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith("/api/flagpilot/flags", {
        projectId: "proj_123",
        key: "new_feature_flag",
        description: "Test description",
        status: "active",
        minImpressionsBeforeOptimization: 100,
        variants: [
          { key: "control", value: false },
          { key: "variant_b", value: { theme: "dark" } },
        ],
      });
      expect(defaultProps.onSaved).toHaveBeenCalledWith(createdFlag);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  test("populates fields when editing an existing flag and submits PUT request", async () => {
    const existingFlag = {
      _id: "flag_99",
      key: "existing_flag",
      description: "Existing desc",
      status: "active" as const,
      minImpressionsBeforeOptimization: 200,
      variants: [
        { key: "control", value: "off" },
        { key: "variant_b", value: "on" },
      ],
    };

    const updatedFlag = { ...existingFlag, description: "Updated desc" };
    mockedApiClient.put.mockResolvedValueOnce({ data: updatedFlag });

    render(<FlagModal {...defaultProps} flag={existingFlag} />);

    expect(screen.getByText("Edit Flag")).toBeInTheDocument();
    expect((screen.getByLabelText(/flag key/i) as HTMLInputElement).value).toBe("existing_flag");

    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Updated desc" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/api/flagpilot/flags/flag_99",
        expect.objectContaining({
          description: "Updated desc",
        })
      );
      expect(defaultProps.onSaved).toHaveBeenCalledWith(updatedFlag);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  test("displays error message on API failure", async () => {
    mockedApiClient.post.mockRejectedValueOnce({
      response: { data: { error: "Duplicate flag key for project" } },
    });

    render(<FlagModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/flag key/i), { target: { value: "duplicate_key" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Duplicate flag key for project")).toBeInTheDocument();
  });
});
