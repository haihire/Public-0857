import { useStore } from "../store";

function Tablemovebtn() {
  const { setIsMove } = useStore();
  return (
    <div className="tablemovebtn" onClick={() => setIsMove(true)}>
      <span title="테이블 이동 버튼"></span>
    </div>
  );
}
export default Tablemovebtn;
