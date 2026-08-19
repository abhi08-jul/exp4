import { memo, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../api/axios.js";

const CalendarView = memo(({ posts = [], onPostUpdated }) => {
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5007";

  // Only scheduled posts are required by the calendar
  const events = useMemo(() => {
    return posts
      .filter((post) => post.scheduledAt)
      .map((post) => ({
        id: post._id,
        title: post.title,
        start: post.scheduledAt,
        extendedProps: {
          post,
        },
      }));
  }, [posts]);

  // Handle event click
  const handleEventClick = useCallback((info) => {
    const post = info.event.extendedProps.post;

    alert(
      `Post: ${post.title}\nStatus: ${post.status}\nScheduled: ${new Date(
        post.scheduledAt
      ).toLocaleString()}`
    );
  }, []);

  // Handle drag and drop
  const handleEventDrop = useCallback(
    async (info) => {
      const postId = info.event.id;
      const newDate = info.event.start;

      try {
        await api.patch(`/posts/${postId}`, {
          scheduledAt: newDate.toISOString(),
          status: "scheduled",
        });

        if (onPostUpdated) {
          onPostUpdated();
        }
      } catch (error) {
        console.error(
          "Failed to update post schedule:",
          error
        );

        info.revert();

        alert(
          "Unable to update the post schedule."
        );
      }
    },
    [onPostUpdated]
  );

  // Handle event resize
  const handleEventResize = useCallback(
    async (info) => {
      const postId = info.event.id;
      const newDate = info.event.start;

      try {
        await api.patch(`/posts/${postId}`, {
          scheduledAt: newDate.toISOString(),
        });

        if (onPostUpdated) {
          onPostUpdated();
        }
      } catch (error) {
        console.error(
          "Failed to resize event:",
          error
        );

        info.revert();
      }
    },
    [onPostUpdated]
  );

  // Custom calendar event UI
  const renderEventContent = useCallback(
    (eventInfo) => {
      const post =
        eventInfo.event.extendedProps.post;

      return (
        <div className="w-full overflow-hidden rounded-md">

          {post.mediaUrl && (
            <img
              src={`${API_BASE}${post.mediaUrl}`}
              alt={post.title}
              className="w-full h-12 object-cover rounded-md mb-1"
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          )}

          <div className="px-1 pb-1">

            <div className="font-semibold text-xs truncate">
              {eventInfo.timeText}
            </div>

            <div className="text-xs truncate">
              {post.title}
            </div>

          </div>

        </div>
      );
    },
    [API_BASE]
  );

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">

      {/* Header */}
      <div className="mb-5">

        <h2 className="font-display text-xl font-bold">
          Post Calendar
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Drag and drop scheduled posts to change
          their date and time.
        </p>

      </div>

      {/* Calendar */}
      <div className="calendar-wrapper">

        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}

          initialView="dayGridMonth"

          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right:
              "dayGridMonth,timeGridWeek,timeGridDay",
          }}

          events={events}

          editable={true}
          selectable={true}

          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventClick={handleEventClick}
          eventContent={renderEventContent}

          height="auto"
          dayMaxEvents={3}
          nowIndicator={true}
          weekends={true}
        />

      </div>

    </div>
  );
});

CalendarView.displayName = "CalendarView";

export default CalendarView;