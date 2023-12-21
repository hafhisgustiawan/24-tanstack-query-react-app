import { useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../utils/http.js';

import Header from '../Header.jsx';
// import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate: mutateDeletion,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: errorDeletion,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient?.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none', //this behavior is stopping auto refetch after invalidate query 1x after this invalidate
      });
      navigate('/events');
    },
  });

  // const deleteEventHandler = () => {
  //   if (window.confirm(`Are you sure to delete ${data?.title}?`)) {
  //     mutateDeletion({ id });
  //   }
  // };

  const handleStartDelete = () => {
    setIsDeleting(true);
  };

  const handletStopDelete = () => {
    setIsDeleting(false);
  };

  const handleDelete = () => {
    // kita bisa menambahkan parameter dan ini akan diteruskan ke mutationFn
    mutateDeletion({ id });
  };

  let content = <p>There is no event</p>;

  if (data) {
    content = (
      <>
        {isDeleting && (
          <Modal onClose={handletStopDelete}>
            <h2>Are you sure?</h2>
            <p>
              Do you really want to delete this event? This action cannot be
              undone.
            </p>
            <div className="form-actions">
              <button onClick={handletStopDelete} className="button-text">
                Cancel
              </button>
              <button onClick={handleDelete} className="button">
                Delete
              </button>
            </div>
          </Modal>
        )}
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
              <button onClick={handleStartDelete}>
                {isPendingDeletion ? 'Deleting...' : 'Delete'}
              </button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data?.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data?.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {data?.date} @ {data?.time}
                </time>
              </div>
              <p id="event-details-description">{data?.description}</p>
            </div>
          </div>
        </article>
      </>
    );
  }

  // if (isPending || isPendingDeletion) {
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

  if (isError || isErrorDeletion) {
    content = (
      <ErrorBlock
        title="There is an error"
        message={
          error?.info || errorDeletion?.info || 'Error when fucking fetch data'
        }
      />
    );
  }

  return content;
}
