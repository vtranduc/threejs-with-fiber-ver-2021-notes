import { createStore, applyMiddleware } from "redux";
import RootState from "./reducers";
import createSagaMiddleware from "redux-saga";
import saga from "./saga";

const sagaMiddleware = createSagaMiddleware();

const store = createStore(RootState, {}, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(saga);

export default store;
