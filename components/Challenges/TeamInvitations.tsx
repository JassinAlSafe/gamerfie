"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";
import type { TeamInvitation } from "@/types/challenge";

interface TeamInvitationsProps {
  challengeId: string;
  teamId: string;
}

export function TeamInvitations({ challengeId, teamId }: TeamInvitationsProps) {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteeUsername, setInviteeUsername] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchInvitations();
  }, [challengeId, teamId]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("team_invitations")
        .select(
          `
          *,
          inviter:profiles!inviter_id(*),
          invitee:profiles!invitee_id(*)
        `
        )
        .eq("team_id", teamId)
        .eq("status", "pending");

      if (error) throw error;
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      setIsInviting(true);

      // Find user by username
      const { data: users, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", inviteeUsername)
        .single();

      if (userError || !users) {
        toast.error("User not found");
        return;
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from("team_invitations")
        .insert({
          team_id: teamId,
          invitee_id: users.id,
          status: "pending",
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

      if (inviteError) {
        if (inviteError.code === "23505") {
          toast.error("User has already been invited");
        } else {
          throw inviteError;
        }
        return;
      }

      toast.success("Invitation sent successfully");
      setInviteeUsername("");
      setIsDialogOpen(false);
      fetchInvitations();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleInvitationResponse = async (
    invitationId: string,
    accept: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("team_invitations")
        .update({
          status: accept ? "accepted" : "rejected",
        })
        .eq("id", invitationId);

      if (error) throw error;

      if (accept) {
        // Update participant's team
        const invitation = invitations.find((i) => i.id === invitationId);
        if (invitation) {
          const { error: joinError } = await supabase
            .from("challenge_participants")
            .update({ team_id: teamId })
            .match({
              challenge_id: challengeId,
              user_id: invitation.invitee_id,
            });

          if (joinError) throw joinError;
        }
      }

      toast.success(`Invitation ${accept ? "accepted" : "rejected"}`);
      fetchInvitations();
    } catch (error) {
      console.error("Error handling invitation:", error);
      toast.error("Failed to process invitation");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Invitations</CardTitle>
            <CardDescription>
              Manage team invitations and requests
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Enter the username of the person you want to invite to your
                  team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={inviteeUsername}
                    onChange={(e) => setInviteeUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteeUsername || isInviting}
                >
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No pending invitations
            </p>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {invitation.invitee?.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      Invited by {invitation.inviter?.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Expires{" "}
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleInvitationResponse(invitation.id, true)
                    }
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleInvitationResponse(invitation.id, false)
                    }
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
