import TextLabeling from "../labeling/TextLabeling";
import ImageLabeling from "../labeling/ImageLabeling";
import AudioLabeling from "../labeling/AudioLabeling";

function Home() {
    return (
      <div className="container pt-5">
        <TextLabeling />
        <ImageLabeling />
        <AudioLabeling />
      </div>
    );
}

export default Home;