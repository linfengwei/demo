class Matcher {
  constructor(mode, template_element) {
    this.mode = mode;
    this.template = cv.imread(template_element);
    // Define parameters for front mode
    if (mode === "front") {
      this.target_loc = { x: 108, y: 26 };
      this.max_match_value = 0.7;
      this.intersection_area = 0.8;
    }
    // Define parameters for back mode
    else if (mode === "back") {
      this.target_loc = { x: 251, y: 134 };
      this.max_match_value = 0.8;
      this.intersection_area = 0.8;
    }
    // Default or invalid mode handling
    else {
      throw new Error("Invalid mode specified");
    }
  }

  match(input_element) {
    let src = cv.imread(input_element);
    let resized = new cv.Mat();
    let dsize = new cv.Size(320, 200);
    cv.resize(src, resized, dsize, 0, 0, cv.INTER_AREA);

    let dst = new cv.Mat();
    let mask = new cv.Mat();

    cv.matchTemplate(resized, this.template, dst, cv.TM_CCOEFF_NORMED, mask);
    let result = cv.minMaxLoc(dst, mask);

    let maxLoc = result.maxLoc;
    let maxMatchValue = result.maxVal;
    let templateRect = {
      x: this.target_loc.x,
      y: this.target_loc.y,
      width: this.template.cols,
      height: this.template.rows,
    };

    // Define the match rectangle
    let matchRect = {
      x: maxLoc.x,
      y: maxLoc.y,
      width: this.template.cols,
      height: this.template.rows,
    };

    let intersectionX1 = Math.max(templateRect.x, matchRect.x);
    let intersectionY1 = Math.max(templateRect.y, matchRect.y);
    let intersectionX2 = Math.min(
      templateRect.x + templateRect.width,
      matchRect.x + matchRect.width
    );
    let intersectionY2 = Math.min(
      templateRect.y + templateRect.height,
      matchRect.y + matchRect.height
    );
    let intersectionArea =
      (Math.max(0, intersectionX2 - intersectionX1) *
        Math.max(0, intersectionY2 - intersectionY1)) /
      (this.template.cols * this.template.rows);

    src.delete();
    resized.delete();
    dst.delete();
    mask.delete();

    console.log(
      "maxMatchValue: " + maxMatchValue,
      "intersectionArea: " + intersectionArea
    );
    if (
      maxMatchValue < this.max_match_value ||
      intersectionArea < this.intersection_area
    )
      return false;
    return true;
  }
}
