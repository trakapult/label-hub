import TextLabeling from "./Labeling/TextLabeling";
import ImageLabeling from "./Labeling/ImageLabeling";
import AudioLabeling from "./Labeling/AudioLabeling";

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