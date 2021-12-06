import { combineReducers } from "redux";
import orbitControlReducer, {
  OrbitControlState,
  setOrbitControlEnabled,
} from "./orbitControlReducer";

export default combineReducers({
  orbitControl: orbitControlReducer,
});

export interface RootState {
  orbitControl: OrbitControlState;
}

export { setOrbitControlEnabled };
