import { Link, useNavigate, useParams } from 'react-router-dom';
import { Fragment } from 'react';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../utils/http.js';
// import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 10000,
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    // onSuccess: () => {
    //   queryClient?.invalidateQueries({
    //     queryKey: ['events'],
    //   });
    // },
    //THIS IS OPTIMISTIC UPDATE, INI AKAN MELAKUKAN UPDATE TANPA HARUS MENUNGGU DATA OTW SERVER DAN JIKA GAGAL AKAN OTOMATIS KEMBALI KE SEBELUM UPDATE. CEK VIDEO 524
    onMutate: async (data) => {
      //this will be call exactly after mutate() called
      //you can change cache data here

      //cancel queries ini tidak akan cancel mutation, tapi hanya useQuery
      await queryClient?.cancelQueries({ queryKey: ['events', id] });

      //rollback data if fail
      const prevData = queryClient?.getQueryData(['events', id]);

      queryClient?.setQueryData(['events', id], data?.event);

      //return ini akan bisa dibaca di blok error context dibawah
      return { prevData };
    },
    onError: (error, data, context) => {
      queryClient?.setQueryData(['events', id], context?.prevData);
    },
    onSettled: () => {
      //this block will call, although its success or error
      //kita invalidate sekali lagi untuk make sure data di frontend udah sama dengan backend
      queryClient?.invalidateQueries(['events', id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  // if (isPending)
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );

  if (isError) {
    content = (
      <Fragment>
        <ErrorBlock
          title="There is an error"
          message={error?.info || 'Error when fucking fetch data'}
        />
        <Link to="../" className="button">
          Okay
        </Link>
      </Fragment>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export const loader = ({ params }) => {
  //INI ADALAH CARA MENGGABUNGKAN REACT ROUTER DAN TANSTACK QUERY
  //DISINI KITA MENGGUNAKAN QUERYCLIENT DAN MEMANGGIL FETCHQUERY FUNCTION DIMANA INI MIRIP DENGAN USEQUERY DI COMPONENT
  return queryClient?.fetchQuery({
    queryKey: ['events', params?.id],
    queryFn: ({ signal }) => fetchEvent({ id: params?.id, signal }),
  });
};

// export const action = async ({ request, params }) => {
//   //HERE WILL NOT BE IMPLEMENTING OPTIMISTIC UPDATE ANYMORE
//   const formData = await request.formData();
//   const updateEventData = Object.fromEntries(formData);
//   await updateEvent({ id: params?.id, event: updateEventData });
//   await queryClient.invalidateQueries(['events']);
//   return redirect('../');
// };
