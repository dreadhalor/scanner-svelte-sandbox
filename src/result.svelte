<script>
  export let scannedResult = '';
  export let onContinue;
</script>

<style>
  .result {
    position: absolute;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 70%;
    background: #fffe;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .result p {
    text-align: center;
    font-family: Helvetica, sans-serif;
    white-space: pre-line;
  }

  .result button {
    color: #2ec1ce;
    background: transparent;
    border: none;
    padding: 10px;
    font-size: 1em;
    cursor: pointer;
  }
</style>

<div class="result">
  <p>{scannedResult}</p>
  <button on:click={onContinue}>OK</button>
</div>
