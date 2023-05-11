export const indexPage = () => {
    const resultCount = document.getElementById("result-count");
    const resultWrapper = document.getElementById("result-wrapper");
    resultCount.innerText = resultWrapper.children.length;
}
