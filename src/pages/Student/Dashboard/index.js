import { Box, Skeleton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
function Home() {
  return (
    <>
      <Card>
        <StudentDetails />
        <StudentCardSVG />
      </Card>

      <div className="row flex-wrap">
        <div className="mt-4 col-md-6 col-sm-12">
          <Card>
            <UpcomingCourses />
          </Card>
        </div>
        <div className="mt-4 col-md-6 col-sm-12">
          <Card>New Announcments</Card>
        </div>
      </div>
    </>
  );
}

function Card({ children }) {
  return (
    <Box
      padding={4}
      className="d-flex align-items-center justify-content-between"
      sx={{ boxShadow: "0px -2px 31px 0px #00000024", borderRadius: "10px" }}
      component="section"
    >
      {children}
    </Box>
  );
}

function StudentDetails() {
  const { user } = useAuth();
  const [profileImgURL, setProfileImgURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  useEffect(() => {
    const fetchStudentPhoto = async () => {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/auth/get-profile-picture/${user?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
          },
        }
      );
      if (response.status === 401) {
        Swal.fire({
          title: "Session expired",
          text: "Session expired, Please login again",
          timer: 2000,
          allowOutsideClick: false,
          didClose: () => {
            logout(); // Redirect to login page
          },
        });
      }

      const ImageURL = await response.json();
      setProfileImgURL(ImageURL.profilePicture);
      setIsLoading(false);
    };
    fetchStudentPhoto();
  }, []);

  return (
    <div className="d-flex flex-column" style={{ flex: "1" }}>
      <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
        Student Details
      </Typography>
      <div className="d-flex align-items-top mt-4">
        <div
          style={{ width: "129px", height: "127", overflow: "hidden" }}
          className="rounded-circle me-3"
        >
          {isLoading ? (
            <Skeleton height="100%" animation="wave" />
          ) : (
            <img
              style={{ height: "100%", width: "100%" }}
              src={profileImgURL}
            />
          )}
        </div>
        <div className="d-flex flex-column" style={{ width: "50%" }}>
          <Typography>
            {JSON.parse(window.sessionStorage.getItem("user"))?.name}
          </Typography>
          <div className="row mt-4">
            <div className="d-flex flex-column col-lg-4 col-md-6 col-12">
              <Typography className="mb-3" color="#6F6B6B">
                Level
              </Typography>
              <Typography sx={{ color: "#2F748F" }}>
                {JSON.parse(sessionStorage.getItem("user"))?.academicLevel}
              </Typography>
            </div>
            <div className="d-flex flex-column col-lg-4 col-md-6 col-12 ">
              <Typography sx={{ color: "#6F6B6B" }} className="mb-3">
                CGPA
              </Typography>
              <Typography sx={{ color: "#2F748F" }}>
                {JSON.parse(sessionStorage.getItem("user"))?.cgpa}
              </Typography>
            </div>
            <div className="d-flex flex-column col-lg-4 col-md-6 col-12 ">
              <Typography sx={{ color: "#6F6B6B" }} className="mb-3">
                College E-mail
              </Typography>
              <Typography sx={{ color: "#2F748F" }}>
                {JSON.parse(window.sessionStorage.getItem("user"))?.email}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentCardSVG() {
  return (
    <svg
      width="212"
      height="273"
      viewBox="0 0 212 273"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M158.159 51.9487C158.077 56.1145 157.871 68.5437 158.2 71.6749L158.159 51.9487ZM158.159 51.9487C160.155 50.3695 164.557 46.4896 164.693 42.705C164.871 37.8041 160.674 37.5455 160.674 37.5455L158.159 51.9487ZM122.341 26.2598C122.341 26.2598 122.956 44.5973 124.296 51.5403C125.636 58.4833 128.876 63.1255 131.76 64.5958C134.645 66.0661 138.582 65.7393 138.582 65.7393L138.254 70.6675"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M36.228 0C36.228 0 45.0184 24.9266 47.5885 34.565C50.1586 44.2035 52.5237 54.1278 52.5237 54.1278L21.1216 60.6215L1.27148 22.9118L36.228 0Z"
        fill="#DE7773"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M39.591 1.78271L38.1692 2.59953L37.6771 1.21094L1.27148 22.9111L19.3444 73.2543L56.0918 56.0195L42.8584 13.1637C43.4872 12.6872 43.993 12.2924 43.993 12.2924L41.4503 2.61314L40.0285 3.29383L39.591 1.78271Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M41.2728 84.5683C41.2728 84.5683 37.7184 75.91 34.3553 71.3902C33.5214 70.2739 32.7695 69.144 32.1133 68.0957L32.3183 68.0141L32.5097 67.9188L32.7011 67.8371L32.8789 67.769L32.8925 67.7554L33.0976 67.6737L33.289 67.592L33.494 67.5104L33.6854 67.4151L33.7538 67.3878L33.8905 67.3334L34.0819 67.2517L34.287 67.1564L34.4783 67.0747L34.6424 67.0067L34.6834 66.993L34.8885 66.8977L35.0799 66.8161L35.2849 66.7344L35.49 66.6391L35.531 66.6255L35.6951 66.5574L36.0915 66.3804L36.2966 66.2987L36.4333 66.2307L36.5016 66.2034L36.7067 66.1218L36.9118 66.0265L38.2515 65.4547L38.3472 65.4139L38.5523 65.3186L38.7573 65.2369L38.9624 65.1416L39.1538 65.0599H39.1675L39.3725 64.9646L39.5776 64.8829L39.7827 64.7876L39.9877 64.7059L40.0697 64.6651L40.1928 64.6107L40.3842 64.529L40.5892 64.4337L40.7943 64.352L40.972 64.2703L40.9994 64.2567L41.2044 64.175L41.4095 64.0797L41.6146 63.998L41.8196 63.9164L41.8743 63.8891L42.0247 63.8211L42.2161 63.7394L42.4211 63.6441L42.6262 63.5624L42.7629 63.4943L43.0227 63.3854L43.2277 63.2901L43.4328 63.2084L43.6242 63.1268L43.6515 63.1132L43.8292 63.0315L44.0206 62.9498L44.2257 62.8681L44.4171 62.7728L44.5401 62.732L44.6222 62.6911L44.8136 62.6094L45.0186 62.5278C47.1786 61.5748 49.2293 60.6763 51.0612 59.8867C51.1432 62.0377 51.1979 64.4064 51.0475 65.2913C50.7467 67.0611 49.1746 72.2751 50.651 75.6241C52.1275 78.9594 41.2728 84.5683 41.2728 84.5683Z"
        fill="white"
      />
      <path
        d="M51.0612 59.8867C51.1432 62.0377 51.1979 64.4064 51.0475 65.2913C50.7467 67.0611 49.1746 72.2751 50.651 75.6241C52.1275 78.9594 41.2728 84.5683 41.2728 84.5683C41.2728 84.5683 37.7184 75.91 34.3553 71.3902C33.5214 70.2739 32.7695 69.144 32.1133 68.0957"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M35.3262 257.53C35.3262 257.53 43.8295 271.484 51.8269 271.484C59.8244 271.484 61.6426 266.175 62.6816 263.479C63.7206 260.77 63.9257 258.306 63.9257 258.306L55.3267 258.796C55.3267 258.796 53.7545 265.929 51.034 266.624C48.3135 267.304 46.1398 264.16 44.1712 260.321C42.189 256.495 35.3262 257.53 35.3262 257.53Z"
        fill="#8BB2B5"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M102.873 189.312C102.873 189.312 103.461 215.668 104.35 232.577C105.238 249.498 109.285 271.62 109.285 271.62H177.038C179.02 248.396 185.541 197.072 183.654 176.72C182.889 168.524 102.873 189.312 102.873 189.312Z"
        fill="black"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M104.432 84.6626C100.577 89.3866 81.3689 113.238 81.3689 113.238C81.3689 113.238 65.3603 85.4522 61.6692 79.8979C57.9644 74.3435 55.6403 71.0898 55.6403 71.0898C55.6403 71.0898 50.1036 74.4796 45.3735 77.6788C40.6297 80.8781 37.7588 83.8731 37.7588 83.8731C37.7588 83.8731 54.1092 141.309 75.6408 144.658C85.2788 146.155 96.4479 139.458 104.418 133.032C103.803 145.094 100.33 186.384 101.821 190.236C103.01 193.286 107.658 195.941 128.192 197.22C148.739 198.5 176.286 187.977 179.253 185.812C182.219 183.647 185.227 180.557 184.926 173.628C184.639 166.685 189 126.32 189 126.32C189 126.32 196.902 110.284 191.556 92.3952C188.494 82.1033 176.559 76.6578 166.949 73.8943L166.921 73.8806C166.101 73.6356 165.254 73.4042 164.406 73.2C158.486 71.7025 153.975 71.2396 153.975 71.2396L152.95 71.4574C141.152 70.5181 130.201 71.7705 130.201 71.7705C121.589 72.1653 109.9 77.9511 104.432 84.6626Z"
        fill="#D3F8FB"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M94.7807 168.318C94.7807 168.318 105.048 181.891 107.823 215.721C110.584 249.551 102.587 269.332 92.607 271.197C82.6409 273.062 80.9594 267.943 78.6901 265.493C76.407 263.028 73.4541 257.038 73.4541 257.038L80.563 255.064C80.563 255.064 84.801 267.848 88.9569 267.262C93.0992 266.663 98.5402 250.64 98.0481 230.669C97.5422 210.711 89.9412 193.395 89.9412 193.395L94.7807 168.318Z"
        fill="#8BB2B5"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M49.9811 155.863C49.9811 155.863 74.0692 150.363 86.7148 157.633C99.3603 164.916 98.171 174.949 96.9816 187.338C95.8059 199.726 91.7867 213.993 91.7867 213.993L59.455 224.408L31.0195 214.973L38.7162 173.67C38.7162 173.67 40.8899 159.103 49.9811 155.863Z"
        fill="black"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M58.0746 157.538C58.0746 157.538 75.2589 156.353 82.86 160.192C90.461 164.031 88.0959 169.436 85.7308 176.515C83.3521 183.594 70.1187 218.309 70.1187 218.309L36.3516 213.98L45.0326 170.13C45.0326 170.13 46.4133 159.212 58.0746 157.538Z"
        fill="black"
        stroke="black"
        stroke-width="0.463865"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M19.3444 73.2549C20.028 73.5544 58.4569 56.6463 58.4569 56.6463L43.6649 3.63477C43.6649 3.63477 12.8781 17.0034 1.27148 22.9117L19.3444 73.2549Z"
        fill="#F97316"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.3633 26.3017L14.6013 39.0849C14.6013 39.0849 31.5395 33.6259 36.338 31.8152C41.1228 29.991 43.2418 28.9564 43.2418 28.9564L39.0038 14.6484C39.0038 14.6484 20.7258 21.8228 10.3633 26.3017Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M220.881 175.126C220.881 175.126 218.557 174.091 217.368 176.256C216.192 178.421 205.365 197.697 205.365 197.697L200.006 206.655C198.68 207.554 197.914 208.071 197.914 208.071L196.916 210.835C196.916 210.835 197.244 211.978 198.351 213.04C198.474 213.149 198.598 213.258 198.748 213.353C201.045 214.932 215.413 221.617 215.413 221.617C215.413 221.617 218.434 223.781 220.703 220.051C222.973 216.307 239.419 187.147 239.419 187.147C239.419 187.147 240.485 185.5 240.089 184.084C240.089 184.084 239.733 182.491 238.694 181.81C238.612 181.756 238.284 181.892 237.737 182.164C233.431 180.286 220.881 175.126 220.881 175.126Z"
        fill="white"
        stroke="#F97316"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M185.7 32.6834C185.7 32.6834 182.46 29.947 182.049 27.8913C181.626 25.8221 184.018 24.3654 185.727 25.2775C187.422 26.1896 189.158 29.7836 189.158 29.7836L185.7 32.6834Z"
        fill="black"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M203.048 54.0559L205.878 56.8331L206.165 56.4792L204.538 52.9805L203.048 54.0559Z"
        fill="black"
      />
      <path
        d="M114.316 89.5645C114.316 89.5645 110.57 103.042 108.889 110.611C107.207 118.18 106.318 122.836 106.318 122.836"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M39.6172 69.4841C39.6172 69.4841 43.8005 64.1067 44.9078 62.5684"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M132.525 71.5527C135.219 89.196 162.164 82.4437 161.849 72.5874"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M126.538 212.576C126.538 212.576 128.903 218.866 130.981 221.82C133.059 224.774 134.727 227.129 134.727 227.129L140.578 270.298"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M170.285 204.408L161.591 216.81"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M172.8 211.787C172.8 211.787 168.808 215.626 167.81 216.851C166.826 218.09 165.049 219.86 165.049 219.86"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M39.209 88.5831C39.209 88.5831 47.3842 82.0758 51.3351 79.3122C55.286 76.5623 58.1432 74.6836 58.1432 74.6836"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M105.512 122.522C105.512 122.522 94.9989 117.213 91.1847 115.443C87.3842 113.673 86.3999 129.86 85.0191 135.959C83.6384 142.044 79.291 151.887 79.291 151.887L83.9801 150.798C83.9801 150.798 85.853 151.397 87.5892 151.097C94.7118 149.885 98.1569 147.176 102.354 141.146L105.471 142.371L109.422 124.006L105.512 122.522Z"
        fill="white"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M48.4783 121.761L82.0677 122.605C82.8196 121.897 83.2434 121.516 83.2434 121.516L88.3016 121.08C88.3016 121.08 90.9264 122.836 90.9811 124.347C91.1315 124.756 91.1725 125.246 91.0221 125.872C90.2292 129.167 70.5021 187.093 70.5021 187.093C70.5021 187.093 69.3127 189.843 66.7016 189.638C64.0768 189.448 28.7238 185.704 28.7238 185.704C28.7238 185.704 27.5481 185.677 26.4818 185.2C26.4818 185.2 26.4271 185.187 26.3451 185.132C26.2494 185.091 26.1674 185.051 26.0854 184.996C25.3471 184.574 23.816 183.485 23.0504 181.402C22.8727 180.926 24.4859 178.884 27.3021 175.821C32.3466 161.676 44.2813 126.852 44.2813 126.852C44.2813 126.852 45.4707 121.189 48.4783 121.761Z"
        fill="#F97316"
      />
      <path
        d="M90.9253 137.498C90.9253 137.498 88.4645 143.093 86.9334 145.802C85.4022 148.511 83.9805 150.799 83.9805 150.799"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M94.5346 139.117C94.5346 139.117 92.7984 143.691 90.7341 146.741C88.6561 149.79 86.9883 151.165 86.9883 151.165"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M98.3354 140.344C98.3354 140.344 96.859 143.638 95.0271 146.007C93.1952 148.362 91.1035 150.282 91.1035 150.282"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M109.012 148.96C109.012 148.96 110.734 142.807 112.361 136.354C113.988 129.914 114.904 124.074 114.904 124.074"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M122.341 26.2607C122.341 26.2607 122.956 44.5983 124.296 51.5413C125.636 58.4842 128.876 63.1265 131.76 64.5967C134.645 66.067 138.582 65.7403 138.582 65.7403L138.254 70.6684L135.807 71.3355C137.105 77.7203 141.781 80.0618 148.22 79.4084C155.26 78.6869 158.432 75.052 159.867 72.1795L158.2 71.6758C157.871 68.5447 158.077 56.1154 158.159 51.9497C160.154 50.3705 164.557 46.4906 164.693 42.706C164.871 37.8051 160.674 37.5464 160.674 37.5464C160.674 37.5464 164.871 17.97 144.05 16.6223C123.229 15.2881 122.341 26.2607 122.341 26.2607Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M153.73 38.8795C153.853 39.8461 153.948 40.7038 154.058 41.33C154.509 43.8213 155.712 42.7458 156.204 41.0169C156.696 39.2743 158.309 37.8585 160.674 37.5454C160.674 37.5454 164.871 37.8041 164.694 42.705C164.516 47.5923 158.159 51.9486 158.159 51.9486C158.159 51.9486 158.186 55.6515 158.05 59.654C162.233 56.5364 167.031 49.6207 169.574 38.4711C172.117 27.3352 170.107 22.4615 165.104 16.4034C160.1 10.359 154.468 9.73273 145.705 10.0867C136.942 10.4406 126.497 10.8899 126.497 10.8899C116.9 11.6659 112.389 9.8008 111.404 12.7822C110.434 15.7636 115.205 17.4925 115.205 17.4925C115.205 17.4925 109.627 18.8266 109.668 21.8625C109.709 24.8847 117.761 24.9664 117.761 24.9664C117.761 24.9664 113.756 28.152 115.232 29.7584C116.709 31.3512 122.505 30.5344 122.505 30.5344C122.505 30.5344 124.884 29.9626 129.108 28.996C130.694 28.6421 132.608 28.0159 134.686 27.4032C134.522 28.0022 134.59 28.6557 135.233 29.2683C136.996 30.9564 145.459 27.0901 145.459 27.0901C145.459 27.0901 147.386 31.0653 151.843 29.4453C153.169 31.7596 153.647 35.0269 153.73 38.8795Z"
        fill="black"
        stroke="black"
        stroke-width="0.463865"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M142.137 44.2451C142.899 44.2451 143.517 43.3735 143.517 42.2983C143.517 41.2232 142.899 40.3516 142.137 40.3516C141.374 40.3516 140.756 41.2232 140.756 42.2983C140.756 43.3735 141.374 44.2451 142.137 44.2451Z"
        fill="black"
      />
      <path
        d="M127.714 42.3935C128.476 42.3935 129.095 41.5219 129.095 40.4468C129.095 39.3716 128.476 38.5 127.714 38.5C126.951 38.5 126.333 39.3716 126.333 40.4468C126.333 41.5219 126.951 42.3935 127.714 42.3935Z"
        fill="black"
      />
      <path
        d="M133.579 40.7871C133.579 40.7871 131.98 48.5741 133.142 50.0035C134.304 51.433 136.478 50.5345 136.478 50.5345"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M136.736 55.0134C136.736 55.0134 137.816 55.4082 139.375 54.5233C140.947 53.6384 141.836 52.209 141.836 52.209"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M161.986 40.5273C158.801 41.6981 156.832 45.2649 157.119 48.5322"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M161.057 44.9244L158.364 43.6855"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M140.675 36.5932C140.675 36.5932 141.618 36.3753 143.204 36.5795C144.79 36.7837 145.624 37.3283 145.624 37.3283"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M125.609 35.6549C127.209 35.0014 129.041 35.2464 130.613 35.8591"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M150.817 59.0156C150.817 59.0156 149.245 61.8473 145.787 63.617C142.328 65.3868 138.582 65.7408 138.582 65.7408"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M184.811 32.9958C184.811 32.9958 184.811 31.5936 186.41 29.9463C188.023 28.2991 189.404 28.5441 189.404 28.5441L205.112 53.1304L203.198 54.7776L184.811 32.9958Z"
        fill="#F97316"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M46.5225 119.378L85.4435 120.359C85.4435 120.359 89.8592 120.182 89.0663 123.476C88.2734 126.771 68.5463 184.697 68.5463 184.697C68.5463 184.697 67.3706 187.46 64.7458 187.256C62.1347 187.065 26.7817 183.322 26.7817 183.322C26.7817 183.322 21.4911 183.172 23.2683 179.047C25.0455 174.922 42.3255 124.47 42.3255 124.47C42.3255 124.47 43.5149 118.807 46.5225 119.378Z"
        fill="#F97316"
      />
      <path
        d="M57.5192 155.154C59.5991 153.916 60.4629 151.543 59.4485 149.853C58.4342 148.163 55.9259 147.796 53.846 149.034C51.7661 150.272 50.9024 152.645 51.9167 154.335C52.931 156.025 55.4394 156.392 57.5192 155.154Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M91.2268 118.508L90.926 115.349C90.926 115.349 87.4262 113.253 84.651 116.302C81.8895 119.352 79.5245 123.082 78.3351 124.416C77.1457 125.736 79.7705 127.506 83.1199 125.451C86.4829 123.381 88.3012 121.081 88.3012 121.081L91.2268 118.508Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.26357 163.936C5.26357 163.936 44.7725 163.84 52.1821 169.544C59.5917 175.249 70.6515 214.783 70.6515 214.783L91.7867 213.993C91.7867 213.993 88.2322 253.146 79.7289 257.666C72.7704 261.368 41.095 264.227 24.4165 258.237C13.2474 253.119 7.53293 237.531 4.74407 226.177C1.95521 214.81 3.36331 211.924 3.36331 211.924L6.60331 203.184C6.60331 203.184 0.287359 174.159 1.0666 169.939C1.85951 165.705 5.26357 163.936 5.26357 163.936Z"
        fill="black"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M6.60331 203.184C6.60331 203.184 0.287359 174.16 1.0666 169.939C1.14863 169.504 1.25799 169.095 1.3947 168.728C12.6322 167.176 43.3917 169.667 47.0145 174.2C51.2115 179.469 56.051 206.751 56.051 206.751C56.051 206.751 48.8874 206.955 35.7087 206.015C22.5162 205.09 6.60331 203.184 6.60331 203.184Z"
        fill="black"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M91.0626 220.418C89.6408 231.717 86.059 254.289 79.7294 257.665C78.0479 258.563 74.8899 259.407 70.857 260.102C69.9684 259.203 69.0524 257.992 68.2458 256.372C65.58 250.967 64.5957 225.877 64.5957 225.877L91.0626 220.418Z"
        fill="black"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M60.9312 261.286C48.8872 262.212 34.1226 261.722 24.4163 258.237C13.2471 253.118 7.53268 237.53 4.74382 226.177C3.04863 219.275 2.89825 215.504 3.04863 213.598C7.64205 213.652 20.1509 213.992 34.2183 216.034C51.9495 218.607 52.7424 222.637 55.3125 231.091C57.1171 237.054 59.6052 252.587 60.9312 261.286Z"
        fill="black"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M45.0186 62.5275L46.1122 61.0845C46.1122 61.0845 46.1943 56.5784 47.1512 53.3791C48.1082 50.1936 51.9224 50.5067 51.4986 52.399C51.0748 54.2913 51.0611 59.8865 51.0611 59.8865C49.2292 60.6761 47.1786 61.5746 45.0186 62.5275Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M219.991 173.751C219.991 173.751 217.667 172.716 216.478 174.881C215.302 177.046 204.475 196.322 204.475 196.322L197.612 207.772C197.612 207.772 195.562 210.413 197.858 211.978C200.155 213.557 214.523 220.242 214.523 220.242C214.523 220.242 217.544 222.406 219.814 218.676C222.083 214.932 238.529 185.772 238.529 185.772C238.529 185.772 240.621 182.505 237.832 181.225C235.043 179.945 219.991 173.751 219.991 173.751Z"
        fill="white"
        stroke="#F97316"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M188.762 28.7619C188.762 28.7619 190.142 26.1889 192.125 26.8288C193.218 27.1827 193.56 28.9389 193.929 30.8857C194.244 32.5193 194.599 34.3027 195.351 35.242C196.267 36.372 196.281 34.7383 196.281 34.7383L197.21 34.7519C197.21 34.7655 197.183 38.9722 194.627 35.8274C193.724 34.6975 193.355 32.7916 193.013 31.049C192.699 29.3882 192.398 27.8907 191.838 27.7137C190.607 27.3189 189.582 29.2112 189.568 29.2112L188.762 28.7619Z"
        fill="black"
      />
      <path
        d="M156.573 138.179L153.114 136.545"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M156.901 136.069C155.712 136.028 154.317 136.028 153.114 136.545"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M90.926 115.349C90.926 115.349 87.4262 113.253 84.6511 116.302C81.8895 119.352 79.5245 123.082 78.3351 124.416C77.1457 125.736 79.7705 127.506 83.1199 125.451C86.483 123.381 88.3012 121.081 88.3012 121.081"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M45.0186 62.5275L46.1122 61.0845C46.1122 61.0845 46.1943 56.5784 47.1512 53.3791C48.1082 50.1936 51.9224 50.5067 51.4986 52.399C51.0748 54.2913 51.0611 59.8865 51.0611 59.8865"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M82.8595 160.191C90.4606 164.03 88.0955 169.435 85.7304 176.514C83.8028 182.273 74.7937 205.865 71.4443 214.66"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M51.9629 169.557C59.3589 175.261 70.4186 214.795 70.4186 214.795L74.7933 214.631"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M70.857 260.102C69.9684 259.203 69.0524 257.992 68.2458 256.372C65.58 250.967 64.5957 225.877 64.5957 225.877L91.0626 220.418"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M3.04883 213.598C7.64225 213.652 20.1511 213.992 34.2185 216.034C51.9496 218.607 52.7425 222.637 55.3127 231.091C57.1172 237.054 59.6053 252.587 60.9314 261.286"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M1.39453 168.728C12.632 167.176 43.3915 169.667 47.0143 174.2C51.2113 179.469 56.0508 206.751 56.0508 206.751C56.0508 206.751 48.8872 206.955 35.7085 206.015C22.5161 205.09 6.60314 203.184 6.60314 203.184"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M89.0666 123.477C88.2737 126.771 68.5466 184.697 68.5466 184.697C68.5466 184.697 67.3709 187.461 64.7461 187.256"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M83.0243 115.498L81.3701 113.238"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M40.2744 81.5586L42.1747 86.2417"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M43.2148 79.2051L45.2108 83.8746"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M46.126 77.1758L48.3407 81.4913"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M49.2158 75.1484L51.3348 79.3142"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M52.0859 73.3086L54.3416 77.2293"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M105.39 142.725L110.147 144.807"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M106.318 138.396L111.281 140.534"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M107.112 134.748L112.362 136.354"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M107.932 130.908L113.277 132.474"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M108.712 127.273L114.044 128.88"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M109.34 124.334L114.589 125.94"
        stroke="#6CA3B7"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M189.001 126.322C189.001 126.322 181.659 156.422 161.905 163.596C142.151 170.77 104.638 146.279 104.638 146.279L109.764 122.401L153.115 136.546L170.203 99.2715"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M1.27148 22.9121L19.3444 73.2553L44.909 62.5686"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M121.575 22.1764C123.886 20.4339 127.44 18.5007 132.334 17.3027"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M121.671 15.6416C124.419 14.8384 126.169 14.3619 129.573 14.0352"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M130.899 22.885C132.253 21.8368 134.071 20.7341 136.354 19.7539"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M196.527 44.1583L198.577 46.9219M188.42 33.2266L194.627 41.6126L188.42 33.2266Z"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M96.12 267.467C90.9114 269.604 87.1245 266.732 87.1245 266.732C87.1245 266.732 84.5271 264.567 82.8729 260.728C81.2187 256.876 80.7676 255.637 80.7676 255.637"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M57.1446 268.543C52.4281 269.51 48.696 266.27 48.696 266.27C48.696 266.27 46.9188 265.044 45.8798 263.315C44.8408 261.586 44.6494 261.246 44.6494 261.246"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M96.9402 207.118C96.3934 205.13 95.1493 200.038 93.9326 198.527"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M98.3074 202.584C97.7606 200.61 96.4755 196.39 95.2998 194.008"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M99.3328 197.358C98.7723 195.384 97.4325 191 96.3115 188.781"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M100.823 192.388C100.276 190.414 98.2255 184.193 97.0225 181.729"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M41.915 4.39653L41.4502 2.61314L40.0285 3.29383L39.591 1.78271L38.1692 2.59953L37.6771 1.21094L35.5034 2.50423L1.27148 22.9111"
        stroke="black"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M159.554 35.4772C159.8 34.2248 160.005 32.7817 160.101 31.3251C160.142 30.6308 160.155 29.9365 160.128 29.2422"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M162.89 33.8033C163.218 31.9383 163.478 29.692 163.341 27.5547"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M165.228 35.9404C165.706 34.1161 166.157 31.8971 166.198 29.7598"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M42.7072 239.832C42.7072 239.832 40.2328 228.819 27.3958 225.375C14.5588 221.93 7.68239 224.272 4.52441 225.279"
        stroke="white"
        stroke-width="1.15966"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

const UpcomingCourses = () => {
  const [upcomingCourses, setUpcomingCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/student/time-table/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.timetable) {
          const filteredCourses = getUpcomingCourses(data.timetable);
          setUpcomingCourses(filteredCourses);
        } else {
          console.error("Error fetching timetable:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch timetable:", error);
      }
      setIsLoading(false);
    };

    fetchTimetable();
  }, []);

  const getUpcomingCourses = (timetable) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayName = daysOfWeek[today.getDay()];
    const tomorrowName = daysOfWeek[tomorrow.getDay()];

    const upcoming = [];

    const filterValidCourses = (courses, day) => {
      return courses.filter((course) => {
        if (!course.time) return true; // If no time is provided, include it.

        const [hours, minutes] = course.time.split(":").map(Number);
        const courseDate = new Date();
        courseDate.setHours(hours, minutes, 0, 0);

        return day === todayName ? courseDate > today : true; // Only filter today's courses
      });
    };

    if (timetable[todayName]) {
      upcoming.push(
        ...filterValidCourses(timetable[todayName], todayName).map(
          (course) => ({
            ...course,
            day: todayName,
          })
        )
      );
    }

    if (timetable[tomorrowName]) {
      upcoming.push(
        ...filterValidCourses(timetable[tomorrowName], tomorrowName).map(
          (course) => ({ ...course, day: tomorrowName })
        )
      );
    }

    return upcoming;
  };

  return (
    <div>
      <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
        Upcoming Courses
      </Typography>
      <div className="d-flex flex-column align-items-start mt-3 w-100">
        {isLoading ? (
          <>
            <Skeleton width="100%" height={50} />
            <Skeleton width="100%" height={50} />
            <Skeleton width="100%" height={50} />
            <Skeleton width="100%" height={50} />
          </>
        ) : upcomingCourses.length > 0 ? (
          <div>
            {upcomingCourses.map((course, index) => (
              <Course course={course} index={index} />
            ))}
          </div>
        ) : (
          <p>No upcoming courses.</p>
        )}
      </div>
    </div>
  );
};

const Course = ({ course, index }) => {
  return (
    <div
      style={{
        backgroundColor: "#8EECF563",
        width: "auto",
        borderRadius: "5px",
        height: "auto",
      }}
      className="d-flex align-items-center justify-content-between flex-wrap mb-3"
      key={index}
    >
      <div
        style={{
          backgroundColor: "#B9E3F0",
          height: "100%",
          width: "auto",
          padding: "20px",
        }}
        className="d-flex flex-column text-center me-4"
      >
        <Typography fontSize="18px">{course.name}</Typography>
        <Typography color="#999191">{course.type}</Typography>
      </div>
      <div className="d-flex flex-column text-center me-4">
        <Typography>
          <span className="fw-bold">{course.day}</span> , From - To{" "}
        </Typography>
        <Typography>
          {course.startTime} - {course.endTime}
        </Typography>
        Room: {course.room}
      </div>
    </div>
  );
};

export default Home;
