import { useEffect, useState } from 'react';
import { ExclamationOctagonFill } from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:4000';
function App() {
  return (
    <div className='position-relative vh-100'>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='check-scraping-progress/:taskId' element={<ScrapingProgressPage />} />
      </Routes>
    </div>
  );
}

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [numOfImages, setNumOfImages] = useState(10);
  const [searchOptions, setSearchOptions] = useState({
    color: '',
    size: '',
    type: '',
    time: '',
    userRights: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/scrape-google-images`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search,
        numOfImages,
        ...searchOptions,
      }),
    });

    const resJson = await res.json();
    navigate(`check-scraping-progress/${resJson.data.taskId}`);
  };

  return (
    <Container className='position-absolute start-50 translate-middle' style={{ top: '36%' }}>
      <Form
        style={{ maxWidth: '700px' }}
        className='text-center mx-auto'
        method='post'
        action={`${API_BASE_URL}/scrape-google-images`}
        onSubmit={handleSubmit}
      >
        <Form.Label className='fs-1 mb-4'>GOOGLE IMAGES SCRAPER</Form.Label>
        <InputGroup className='mb-2'>
          <Form.Control
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            required
            type='text'
            name='search'
            placeholder='Search'
          />
          <Form.Control
            value={numOfImages}
            onChange={(e) => setNumOfImages(e.target.value)}
            style={{ maxWidth: '18%' }}
            type='number'
            name='numOfImages'
            placeholder='No.'
          />
          <Button variant='primary' type='submit'>
            Scrape
          </Button>
        </InputGroup>
        <Row className='g-2' xll={5} xl={5} lg={5} md={5} sm={2} xs={2}>
          <Col>
            <Form.Select
              value={searchOptions.size}
              onChange={(e) => setSearchOptions({ ...searchOptions, size: e.target.value })}
              name='size'
            >
              <option value=''>Any Size</option>
              <option value='l'>Large</option>
              <option value='m'>Medium</option>
              <option value='i'>Icon</option>
            </Form.Select>
          </Col>
          <Col>
            <Form.Select
              value={searchOptions.color}
              onChange={(e) => setSearchOptions({ ...searchOptions, color: e.target.value })}
              name='color'
            >
              <option value=''>Any Color</option>
              <option value='gray'>Black & White</option>
              <option value='trans'>Transparent</option>
              <option value='specific,isc:red'>Red</option>
              <option value='specific,isc:orange'>Orange</option>
              <option value='specific,isc:yellow'>Yellow</option>
              <option value='specific,isc:green'>Green</option>
              <option value='specific,isc:teal'>Teal</option>
              <option value='specific,isc:blue'>Blue</option>
              <option value='specific,isc:purple'>Purple</option>
              <option value='specific,isc:pink'>Pink</option>
              <option value='specific,isc:white'>White</option>
              <option value='specific,isc:gray'>Gray</option>
              <option value='specific,isc:black'>Black</option>
              <option value='specific,isc:brown'>Brown</option>
            </Form.Select>
          </Col>
          <Col>
            <Form.Select
              value={searchOptions.type}
              onChange={(e) => setSearchOptions({ ...searchOptions, type: e.target.value })}
              name='type'
            >
              <option value=''>Any Type</option>
              <option value='clipart'>Clip Art</option>
              <option value='lineart'>Line Drawing</option>
              <option value='animated'>GIF</option>
            </Form.Select>
          </Col>
          <Col>
            <Form.Select
              value={searchOptions.time}
              onChange={(e) => setSearchOptions({ ...searchOptions, time: e.target.value })}
              name='time'
            >
              <option value=''>Any Time</option>
              <option value='d'>Past 23 Hours</option>
              <option value='w'>Past Week</option>
              <option value='m'>Past Month</option>
              <option value='y'>Past Year</option>
            </Form.Select>
          </Col>
          <Col sm={12} xs={12}>
            <Form.Select
              value={searchOptions.userRights}
              onChange={(e) => setSearchOptions({ ...searchOptions, userRights: e.target.value })}
              name='userRights'
            >
              <option value=''>All</option>
              <option value='cl'>Creative Cloud License</option>
              <option value='ol'>Commercial & Other License</option>
            </Form.Select>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

const ScrapingProgressPage = () => {
  const [info, setInfo] = useState({ message: 'Initializing...', progress: '' });
  const [loadingAndError, setLoadingAndError] = useState({ isLoading: true, error: false });
  const { taskId } = useParams();

  useEffect(() => {
    const timer = setInterval(async () => {
      const res = await fetch(`${API_BASE_URL}/check-scraping-progress/${taskId}`, {
        method: 'GET',
      }).catch(() => null);

      if (!res || !res.ok) {
        setInfo({ ...info, message: 'An Unexpected Error Occurred' });
        setLoadingAndError({ isLoading: false, error: true });
        clearInterval(timer);
        return;
      }

      const task = (await res.json()).data;
      switch (task.status) {
        case 'LOADING':
          setInfo({ message: task.msg, progress: task.progress });
          break;
        case 'SUCCESS':
          setLoadingAndError({ isLoading: false, error: false });
          clearInterval(timer);
          break;
        default:
          setInfo({ message: task.msg, progress: task.progress });
          setLoadingAndError({ isLoading: false, error: true });
          clearInterval(timer);
      }
    }, 1 * 1000);
  }, []);

  const { isLoading, error } = loadingAndError;
  const { message, progress } = info;

  if (!isLoading) {
    if (error) return <ErrorPage message={message} />;
    else return <DownloadPage taskId={taskId} />;
  } else return <LoadingPage message={message} progress={progress} />;
};

const LoadingPage = ({ message, progress }) => {
  return (
    <Container className='d-flex flex-column text-center position-absolute start-50 translate-middle top-50'>
      <Spinner className='mx-auto' animation='border' role='status' />
      <div className='fs-4 mt-4'>{message}</div>
      <div className='fs-5'>{progress}</div>
    </Container>
  );
};

const DownloadPage = ({ taskId }) => {
  return (
    <Container className='d-flex flex-column text-center position-absolute start-50 translate-middle top-50'>
      <div className='fs-4 mb-3'>Your Images Are Ready</div>
      <Button
        href={`${API_BASE_URL}/download-scraped-images/${taskId}`}
        style={{ width: 'fit-content', margin: '0 auto' }}
      >
        Download
      </Button>
    </Container>
  );
};

const ErrorPage = ({ message }) => {
  return (
    <Container className='d-flex flex-column text-center position-absolute start-50 translate-middle top-50'>
      <ExclamationOctagonFill size={96} color='red' style={{ margin: '0 auto' }} />
      <div className='fs-4 mb-3 mt-3'>{message}</div>
      <Button as={Link} to='/' style={{ width: 'fit-content', margin: '0 auto' }}>
        Try Again
      </Button>
    </Container>
  );
};

export default App;
