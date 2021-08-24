import React, { useCallback, useEffect, useMemo, useReducer } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";
import useHttp from "../../hooks/http";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("Should not get there!");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const { isLoading, error, data, sendRequest, reqExtra, reqId } = useHttp();

  // useEffect will run on the first render and then anytime anything in the dependencies array changes

  useEffect(() => {
    if (!isLoading && !error && reqId === "REMOVE_ING") {
      dispatch({ type: "DELETE", id: reqExtra });
    } else if (!isLoading && !error && reqId === "ADD_ING") {
      dispatch({
        type: "ADD",
        ingredient: { id: data.name, ...reqExtra },
      });
    }
  }, [reqExtra, data, reqId, isLoading]);

  const filterHandler = useCallback((filteredIngredients) => {
    dispatch({
      type: "SET",
      ingredients: filteredIngredients,
    });
  }, []);

  // useCallback will cache the function on rerender

  const addIngredientHandler = useCallback(
    (ingredient) => {
      sendRequest(
        "https://react-course-recap-default-rtdb.firebaseio.com/ingredients.json",
        "POST",
        JSON.stringify(ingredient),
        ingredient,
        "ADD_ING"
      );
    },
    [sendRequest]
  );

  const removeIngredientHandler = useCallback(
    (ingredientId) => {
      sendRequest(
        `https://react-course-recap-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
        "DELETE",
        null,
        ingredientId,
        "REMOVE_ING"
      );
    },
    [sendRequest]
  );

  const clearError = () => {};

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filterHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;
