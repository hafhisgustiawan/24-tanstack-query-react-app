import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../../utils/http';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import EventItem from './EventItem';

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', { search: searchTerm }],
    queryFn: ({ signal }) => fetchEvents({ signal, keyword: searchTerm }),
    //enabled disini berguna ketika kita hanya mau mengirimkan request ketika sebuah value ada atau memang dibutuhkan saja, ketika enabled ini false, maka nilai isPending adalah true, makanya disini kita gunakan isLoading, dimana ketika enabled itu false dia akan false aja kalo gak ada request yang lagi dikirim.
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement?.current?.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;

  if (isLoading) content = <LoadingIndicator />;
  if (isError) {
    content = (
      <ErrorBlock
        title="An error occured"
        message={error?.info?.message || 'Failed to fetch events'}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data?.map((el) => (
          <li key={el?.id}>
            <EventItem event={el} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
