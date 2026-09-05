function ErrorMessage({

  message

}) {

  return (

    <div className="error-message">


      <h2>

        ⚠️ Prediction Error

      </h2>


      <p>

        {message}

      </p>


      <small>

        Make sure the ResQAI backend
        is running on port 8000.

      </small>


    </div>

  );

}


export default ErrorMessage;