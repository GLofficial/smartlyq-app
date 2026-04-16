import { useState, useCallback } from "react";
import { useCalendarEvents } from "@/api/social";
import { useEditPost, useDeletePost, useRetryPost } from "@/api/social-posts";
import { toast } from "sonner";
import ContentCalendar from "./ContentCalendar";

export function CalendarPage() {
  // Date range for current calendar view
  const [dateRange] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      start: start.toISOString().split("T")[0]!,
      end: end.toISOString().split("T")[0]!,
    };
  });

  const { data: calendarData } = useCalendarEvents(dateRange.start, dateRange.end);
  const editPost = useEditPost();
  const deletePost = useDeletePost();
  const retryPost = useRetryPost();

  const handleReschedule = useCallback((postId: number, newDate: string, newTime: string) => {
    editPost.mutate(
      { post_id: postId, scheduled_time: `${newDate}T${newTime}:00` },
      {
        onSuccess: () => toast.success("Post rescheduled"),
        onError: (err) => toast.error((err as Error).message || "Reschedule failed"),
      },
    );
  }, [editPost]);

  const handleDelete = useCallback((postId: number) => {
    deletePost.mutate(postId, {
      onSuccess: () => toast.success("Post deleted"),
      onError: (err) => toast.error((err as Error).message || "Delete failed"),
    });
  }, [deletePost]);

  const handleRetry = useCallback((postId: number) => {
    retryPost.mutate(postId, {
      onSuccess: () => toast.success("Retrying post..."),
      onError: (err) => toast.error((err as Error).message || "Retry failed"),
    });
  }, [retryPost]);

  const realEvents = calendarData?.events ?? [];

  return (
    <ContentCalendar
      realEvents={realEvents}
      onReschedulePost={handleReschedule}
      onDeletePost={handleDelete}
      onRetryPost={handleRetry}
    />
  );
}
