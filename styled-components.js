import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import ENV from './env.js'
import Monitoring from './monitor.js'

class DBMon extends React.PureComponent {
    constructor (...args) {
        super(...args)

        this.state = {
            databases: []
        }
    }

    loadSamples () {
        this.setState({ databases: ENV.generateData().toArray() });
        Monitoring.renderRate.ping();
        setTimeout(this.loadSamples.bind(this), ENV.timeout);
    }

    componentDidMount () {
        this.loadSamples()
    }

    render () {
        var databases = this.state.databases.map(function(database) {
            return <Database
                key={database.dbname}
                lastMutationId={database.lastMutationId}
                dbname={database.dbname}
                samples={database.samples}
                lastSample={database.lastSample} />
        });

        return (
            <div>
                <table className="table table-striped latest-data">
                    <tbody>
                        { databases }
                    </tbody>
                </table>
            </div>
        );
    }
}

class Database extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.lastMutationId === this.props.lastMutationId) return false;
        return true;
    }

    render () {
        var lastSample = this.props.lastSample;
        return (
            <tr key={this.props.dbname}>
                <Td children={this.props.dbname} />
                <Td className="query-count">
                    <NumQueries queries={this.props.lastSample.nbQueries} children={this.props.lastSample.nbQueries} />
                </Td>
                {this.props.lastSample.topFiveQueries.map(function(query, index) {
                    return <Query key={index}
                        query={query.query}
                        elapsed={query.elapsed}
                        formatElapsed={query.formatElapsed}
                        elapsedClassName={query.elapsedClassName} />
                })}
            </tr>
        );
    }
}

class Query extends React.PureComponent {
    render () {
        return (
            <td className={ "Query " + this.props.elapsedClassName}>
                {this.props.formatElapsed}
                <div className="popover left">
                    <div className="popover-content">{this.props.query}</div>
                    <div className="arrow"/>
                </div>
            </td>
        );
    }
}

const Td = styled.td`
    border-top:1px solid #ddd;
    line-height:1.42857143;
    padding:8px;
    vertical-align:top;
`
const NumQueries = styled.span`
    border-radius:.25em;
    color:#fff;
    display:inline;
    font-size:75%;
    font-weight:700;
    line-height:1;
    padding:.2em .6em .3em;
    text-align:center;
    vertical-align:baseline;
    white-space:nowrap;

    background-color: ${p => {
        if (p.queries >= 10) return '#f0ad4e'
        return '#5cb85c'
    }}
`

ReactDOM.render(<DBMon />, document.getElementById('dbmon'))
