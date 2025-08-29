import moment from "moment";

export const getSchemeCode = (countryCode) => {
  if (countryCode.length === 1) {
    return `00${countryCode}`;
  } else if (countryCode.length === 2) {
    return `0${countryCode}`;
  } else if (countryCode.length === 3) {
    return countryCode;
  }

  return "000";
};

export const generateReference = (merchant, wallet) => {
  const timestamp = moment.now().toString();
  let referenceId =
    "XCelWEB" + merchant.organization_no + wallet + "web" + timestamp;
  return referenceId;
};

export const generateRandom4Digit = () => {
  return Math.floor(1000 + Math.random() * 9000);
};




