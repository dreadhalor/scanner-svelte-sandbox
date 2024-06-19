<script lang="ts">
  import { onMount } from "svelte";
  import { initializeScanner, startScanner, stopScanner } from "./scanner";
  import Result from './result.svelte';

  let scannedResult = '';
  let showResult = false;

  function handleContinue() {
    showResult = false;
    window.continueScanning();
  }

  function setResult(result: string) {
    scannedResult = result;
    showResult = true;
    stopScanner();
  }

  onMount(async () => {
    await initializeScanner(setResult);
    startScanner();
  });
</script>

<style>
  * {
    box-sizing: border-box;
  }


  #data-capture-view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  @supports (-webkit-touch-callout: none) {
    #data-capture-view {
      height: -webkit-fill-available;
    }
  }
</style>

<div id="data-capture-view"></div>
{#if showResult}
  <Result {scannedResult} onContinue={handleContinue} />
{/if}
