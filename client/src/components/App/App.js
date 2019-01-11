import React from "react";
import "./App.scss";
import Main from "../Main/Main";
import Header from "../Header/Header";
import axios from "axios";
import { api } from "../../config";
import TextField from "../TextField/TextField";
import DataTable from "../DataTable/DataTable";
import Footer from "../Footer/Footer";
import Card from "../Card/Card";
import ProfileListItem from "../ProfileListItem/ProfileListItem";
import EntryBanner from "../EntryBanner/EntryBanner";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      politeEntries: [],
      toxicEntries: [],
      textFieldValue: "",
      headerSize: "large",
      bannerShow: false,
      userEntry: {
        username: "",
        score: "",
        imgUrl: ""
      }
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
      // this.setState({ entries });
      ////
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
              imgUrl: entryResponse.imgUrl
            }
          });
        })
        .catch(() => {
          console.log(`Failed to post entry`);
          this.setState({
            bannerShow: true,
            userEntry: {
              username: "Failed to post entry"
            }
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
    const { textFieldValue, toxicEntries, politeEntries } = this.state;

    return (
      <div className="App">
        <Header
          display={this.state.headerSize}
          bannerShow={this.state.bannerShow}
          userEntry={this.state.userEntry}
        >
          <TextField
            onSubmit={onSubmitHandler}
            onChange={onChangeHandler}
            value={textFieldValue}
          />
        </Header>
        <Main>
          <Card
            title="Top 5 Most Toxic"
            className="toxic"
            entries={toxicEntries}
          />
          <Card
            title="Top 5 Most Friendly"
            className="friendly"
            entries={politeEntries}
          />
        </Main>
        <Footer />
      </div>
    );
  }
}

export default App;
