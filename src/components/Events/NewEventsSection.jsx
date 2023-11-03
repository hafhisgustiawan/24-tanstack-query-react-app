import { useQuery } from "@tanstack/react-query";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../utils/http.js";

export default function NewEventsSection() {
  //error disini akan true jika di queryFn nya itu pakai throw
  const { data, isPending, isError, error } = useQuery({
    //query key is for identifier that can be use again with cache, that can be string or object or other
    queryKey: ["events"],
    //react query wants a func that return promise, that is it
    queryFn: fetchEvents,
    // staleTime:fet 5000, //default value is 0, this set time for refetch data
    // gcTime: 1000, //default is 5 minutes, this set time how long cache will be saved
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error?.info?.message || "Failed to fetch events"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
