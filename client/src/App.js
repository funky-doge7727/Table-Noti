import React, { useState, useEffect } from "react";

import Main from "./components/main"
import Book from "./components/book"
import ModifyTable from "./components/modifytable"
 
export default _ => {
  const [page, setPage] = useState(0)
  
  useEffect(() => {
    setPage(JSON.parse(localStorage.getItem('page')))
  }, []);

  useEffect(() => {
    localStorage.setItem('page', page)
  }, [page]);

  return (
    <div>
      {!page && <Main setPage={setPage} />}
      {(page === 1 && localStorage.getItem('token')) ? <Book setPage={setPage} /> : null }
      {(page === 2 && localStorage.getItem('token')) ? <ModifyTable setPage={setPage} /> : null}
    </div>
  );
};
