import React from 'react';
import './App.css';
import TextLabeling from './components/TextLabeling';
import ImageLabeling from './components/ImageLabeling';
import AudioLabeling from './components/AudioLabeling';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div>
      <TextLabeling />
      <ImageLabeling />
      <AudioLabeling />
    </div>
  );
}

export default App;