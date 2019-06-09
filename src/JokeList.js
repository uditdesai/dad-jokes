import React, { Component } from 'react';
import axios from "axios";
import uuid from 'uuid/v4';
import Joke from './Joke';
import "./JokeList.css";

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    };
    constructor(props) {
        super(props);
        this.state = { jokes: JSON.parse(window.localStorage.getItem("jokes")) || "[]" };
        this.handleClick = this.handleClick.bind(this);
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    }
    componentDidMount() {
        if (this.state.jokes.length === 0) {
            this.getJokes();
        }
    }
    async getJokes() {
        //load jokes
        try {
            let jokes = [];
            while (jokes.length < this.props.numJokesToGet) {
                let res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: 'application/json' } });
                let newJoke = res.data.joke;
                if (!this.seenJokes.has(newJoke)) {
                    jokes.push({ id: uuid(), text: newJoke, votes: 0 });
                }
            }
            this.setState(st => ({
                jokes: [...st.jokes, ...jokes]
            }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            );
        } catch (err) {
            alert(err);
        }
    }
    handleVote(id, delta) {
        this.setState(
            st => ({
                jokes: st.jokes.map(j =>
                    j.id === id ? { ...j, votes: j.votes + delta } : j
                )
            }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }
    handleClick() {
        this.getJokes();
    }
    render() {
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">Dad Jokes</h1>
                    <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>
                </div>
                <div className="JokeList-jokes">
                    {jokes.map(j => (
                        <Joke key={j.id} votes={j.votes} text={j.text}
                            upvote={() => this.handleVote(j.id, 1)}
                            downvote={() => this.handleVote(j.id, -1)}
                        />
                    ))}
                </div>
            </div>
        )
    }
}

export default JokeList;