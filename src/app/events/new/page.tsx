import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEventAction } from "@/lib/actions/events";
import Link from "next/link";

const NewEventPage = async () => {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEventAction} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                required
                placeholder="Team dinner..."
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Optional details about the event"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                name="location"
                placeholder="Optional location"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="eventDate">Date and time</FieldLabel>
              <Input id="eventDate" name="eventDate" type="datetime-local" />
              <FieldDescription>
                Optional, you can set this later.
              </FieldDescription>
            </Field>

            <div className="flex items-center gap-3">
              <Button type="submit">Create event</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={"/dashboard"}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewEventPage;
