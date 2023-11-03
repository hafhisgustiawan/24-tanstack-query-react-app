import { Link, useNavigate } from 'react-router-dom';
//useMutation is optimized for sending data, useQuery usually used for getting data. Use mutation provided not fetching data when a component is render or rerender
import { useMutation } from '@tanstack/react-query';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { queryClient } from '../../utils/http.js';

export default function NewEvent() {
  const navigate = useNavigate();

  //useMutation cek video 515
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      //cek video 517, ini akan memvalidasi query dengan key yang ada value ['events'], mau dia ['events', {blablablaa}] juga termasuk. Kecuali kita nambahin key exact: true/
      queryClient.invalidateQueries({ queryKey: ['events'] /*exact:true*/ });
      navigate('/events');
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && <p>Submitting...</p>}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={
            error?.info?.message ||
            'Failed to create event, please check your input and try again later'
          }
        />
      )}
    </Modal>
  );
}
