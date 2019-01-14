import React from "react";
import "./App.scss";
import Main from "../Main/Main";
import Header from "../Header/Header";
import axios from "axios";
import { api } from "../../config";
import TextField from "../TextField/TextField";
import Footer from "../Footer/Footer";
import Card from "../Card/Card";
import InfoComponentIcon from "../InfoComponentIcon/InfoComponentIcon";
import InfoComponent from "../InfoComponent/InfoComponent";

/**
 * Main component for the client, rendering all other components. Also handles the state of the application and user input. All logic maintaining the data
 * shown on the website is located in this class.
 */

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      politeEntries: [],
      toxicEntries: [],
      textFieldValue: "",
      headerSize: "large",
      bannerShow: true,
      userEntry: {
        username: "",
        score: "",
        imgUrl: "",
        channelId: "",
        channelTitle: "",
        showTutorial: true
      },
      isFetching: false
    };
  }

  componentDidMount() {
    this.fetchEntries();
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = e => {
    if (window.scrollY > 150) {
      if (this.state.headerSize !== "small") {
        this.setState({ headerSize: "small" });
      }
    } else {
      if (this.state.headerSize !== "large") {
        this.setState({ headerSize: "large" });
      }
    }
  };

  fetchEntries = () => {
    axios.get(`${api}/entries`).then(res => {
      const { entries } = res.data;

      const toxic = entries.toxic;
      const polite = entries.polite;
      this.setState({
        toxicEntries: toxic,
        politeEntries: polite
      });
    });
  };

  clearTextField = () => {
    this.setState({ textFieldValue: "" });
  };

  onSubmitHandler = e => {
    e.preventDefault();
    const { textFieldValue } = this.state;
    if (textFieldValue) {
      this.setState({
        isFetching: true
      });
      axios
        .post(`${api}/entry`, { value: textFieldValue })
        .then(res => {
          const entryResponse = res.data;
          this.fetchEntries();
          this.clearTextField();

          this.setState({
            bannerShow: true,
            userEntry: {
              username: entryResponse.username,
              score: entryResponse.score,
              imgUrl: entryResponse.imgUrl,
              channelId: entryResponse.channelId,
              channelTitle: entryResponse.channelTitle
            },
            isFetching: false
          });
        })
        .catch(error => {
          console.log(`Failed to post entry`);

          this.setState({
            bannerShow: true,
            userEntry: {
              username:
                "Failed to post entry, try to use a different search term",
              showTutorial: true
            },
            isFetching: false
          });
        });
    }
  };

  onChangeHandler = e => {
    const { value } = e.currentTarget;
    this.setState({ textFieldValue: value });
  };

  render() {
    const { onSubmitHandler, onChangeHandler } = this;
    const {
      textFieldValue,
      toxicEntries,
      politeEntries,
      isFetching
    } = this.state;

    return (
      <div className="App">
        <Header
          display={this.state.headerSize}
          bannerShow={this.state.bannerShow}
          userEntry={this.state.userEntry}
        >
          <InfoComponentIcon />
          <TextField
            onSubmit={onSubmitHandler}
            onChange={onChangeHandler}
            value={textFieldValue}
            isFetching={isFetching}
          />
        </Header>
        <Main>
          <Card
            title="Top 10 Most Toxic"
            className="toxic"
            entries={toxicEntries}
          />
          <Card
            title="Top 10 Most Polite"
            className="friendly"
            entries={politeEntries}
          />
        </Main>
        <InfoComponent />
        <Footer />
      </div>
    );
  }
}

export default App;
