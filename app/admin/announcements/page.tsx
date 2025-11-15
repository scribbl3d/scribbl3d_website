"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Announcement {
  id: string;
  text: string;
}

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/announcements");
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        setError("Failed to fetch announcements");
      }
    } catch (error) {
      setError(
        "Error fetching announcements: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newAnnouncement }),
      });

      if (response.ok) {
        const addedAnnouncement = await response.json();
        setAnnouncements([...announcements, addedAnnouncement]);
        setNewAnnouncement("");
      } else {
        setError("Failed to add announcement");
      }
    } catch (error) {
      setError(
        "Error adding announcement: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAnnouncements(announcements.filter((a) => a.id !== id));
      } else {
        setError("Failed to delete announcement");
      }
    } catch (error) {
      setError(
        "Error deleting announcement: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAnnouncement} className="mb-6">
            <div className="flex items-end gap-4">
              <div className="flex-grow">
                <Label htmlFor="newAnnouncement">New Announcement</Label>
                <Input
                  id="newAnnouncement"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Enter new announcement"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                Add Announcement
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2">
              {announcements.map((announcement) => (
                <li
                  key={announcement.id}
                  className="flex items-center justify-between p-2 bg-gray-100 rounded"
                >
                  <span>{announcement.text}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
