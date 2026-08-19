import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CalendarView from "../components/CalendarView.jsx";
import api from "../api/axios.js";

vi.mock("../api/axios.js", () => ({
        default: {
                patch: vi.fn(),
        },
}));

describe("CalendarView", () => {
        beforeEach(() => {
                vi.clearAllMocks();
        });

        it("renders the Post Calendar heading", () => {
                render(<CalendarView posts={[]} />);

                expect(
                        screen.getByText("Post Calendar")
                ).toBeInTheDocument();
        });

        it("renders calendar navigation", () => {
                render(<CalendarView posts={[]} />);

                expect(
                        screen.getByText("today")
                ).toBeInTheDocument();

                expect(
                        screen.getByText("month")
                ).toBeInTheDocument();

                expect(
                        screen.getByText("week")
                ).toBeInTheDocument();

                expect(
                        screen.getByText("day")
                ).toBeInTheDocument();
        });

        it("renders a scheduled post", () => {
                const posts = [
                        {
                                _id: "post123",
                                title: "Test Social Post",
                                description: "Testing calendar post",
                                scheduledAt: "2026-08-13T15:00:00.000Z",
                                status: "scheduled",
                                platforms: ["twitter"],
                                mediaUrl: null,
                                mediaType: null,
                        },
                ];

                render(<CalendarView posts={posts} />);

                expect(
                        screen.getByText("Test Social Post")
                ).toBeInTheDocument();
        });

        it("renders post media when media exists", () => {
                const posts = [
                        {
                                _id: "post456",
                                title: "Image Post",
                                description: "Post with image",
                                scheduledAt: "2026-08-13T15:00:00.000Z",
                                status: "scheduled",
                                platforms: ["instagram"],
                                mediaUrl: "/uploads/test.jpg",
                                mediaType: "image",
                        },
                ];

                render(<CalendarView posts={posts} />);

                const image = screen.getByAltText("Image Post");

                expect(image).toBeInTheDocument();
                expect(image).toHaveAttribute(
                        "src",
                        "http://localhost:5007/uploads/test.jpg"
                );
        });

        it("does not render unscheduled posts", () => {
                const posts = [
                        {
                                _id: "draft123",
                                title: "Draft Post",
                                description: "This is a draft",
                                scheduledAt: null,
                                status: "draft",
                                platforms: ["twitter"],
                                mediaUrl: null,
                                mediaType: null,
                        },
                ];

                render(<CalendarView posts={posts} />);

                expect(
                        screen.queryByText("Draft Post")
                ).not.toBeInTheDocument();
        });

        it("accepts the onPostUpdated callback", () => {
                const onPostUpdated = vi.fn();

                render(
                        <CalendarView
                                posts={[]}
                                onPostUpdated={onPostUpdated}
                        />
                );

                expect(onPostUpdated).not.toHaveBeenCalled();
        });

        it("handles calendar interaction without crashing", () => {
                const posts = [
                        {
                                _id: "post789",
                                title: "Interactive Post",
                                description: "Testing interaction",
                                scheduledAt: "2026-08-13T15:00:00.000Z",
                                status: "scheduled",
                                platforms: ["twitter"],
                                mediaUrl: null,
                                mediaType: null,
                        },
                ];

                render(<CalendarView posts={posts} />);

                const post = screen.getByText("Interactive Post");

                expect(post).toBeInTheDocument();

                fireEvent.click(post);

                expect(api.patch).not.toHaveBeenCalled();
        });
});