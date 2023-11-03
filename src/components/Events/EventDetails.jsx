import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['event-detail', { id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient?.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
  });

  const deleteEventHandler = () => {
    if (window.confirm(`Are you sure to delete ${data?.title}?`)) {
      deleteMutation?.mutate({ id });
    }
  };

  let content = <p>There is no event</p>;

  if (isPending) content = <LoadingIndicator />;
  if (isError) {
    content = (
      <ErrorBlock
        title="There is an error"
        message={
          error?.info ||
          deleteMutation?.error?.info ||
          'Error when fucking fetch data'
        }
      />
    );
  }

  if (data) {
    content = (
      <>
        <Outlet />
        <Header>
          <Link to="/events" className="nav-item">
            View all Events
          </Link>
        </Header>
        <article id="event-details">
          <header>
            <h1>{data?.title}</h1>
            <nav>
              <button onClick={deleteEventHandler}>
                {deleteMutation?.isPending ? 'Deleting...' : 'Delete'}
              </button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data?.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data?.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{data?.date}</time>
              </div>
              <p id="event-details-description">{data?.description}</p>
            </div>
          </div>
        </article>
      </>
    );
  }

  return content;
}
