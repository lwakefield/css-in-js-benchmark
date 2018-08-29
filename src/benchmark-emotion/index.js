import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'react-emotion'

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
                <Table>
                    <tbody>
                        { databases }
                    </tbody>
                </Table>
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
            <StyledQuery>
                {this.props.formatElapsed}
                <Popover>
                    <div className="popover-content">{this.props.query}</div>
                    <div className="arrow"/>
                </Popover>
            </StyledQuery>
        );
    }
}

const Table = styled('table')`
    width: 100%;
`

const Td = styled('td')`
    border-top:1px solid #ddd;
    line-height:1.42857143;
    padding:8px;
    vertical-align:top;
`
const NumQueries = styled('span')`
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

const Popover = styled('div')`
    background-color:#fff;
    background-clip:padding-box;
    border:1px solid #ccc;
    border:1px solid rgba(0,0,0,.2);
    border-radius:6px;
    box-shadow:0 5px 10px rgba(0,0,0,.2);
    display:none;
    left:0;
    max-width:276px;
    padding:1px;
    position:absolute;
    text-align:left;
    top:0;
    white-space:normal;
    z-index:1010;
`

const StyledQuery = styled('td')`
    border-top:1px solid #ddd;
    line-height:1.42857143;
    padding:8px;
    vertical-align:top;
    position: relative;
    ${''
        // the following doesn't play nice with emotion out of the box
        /*
            :hover ${Popover} {
                display:block;
                left:-100%;
                width:100%;
            }
        */
    }
`

ReactDOM.render(<DBMon />, document.getElementById('dbmon'))
