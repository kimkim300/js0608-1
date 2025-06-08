const API_KEY = 'cf3b42a6e42b4871ab621027250806';
const API_URL = 'https://api.weatherapi.com/v1';
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Unsplash API 키를 여기에 입력하세요

async function getWeather() {
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value.trim();

    if (!city) {
        showToast('도시 이름을 입력해주세요.');
        return;
    }

    try {
        // 로딩 상태 표시
        document.querySelector('.weather-card').classList.add('loading');
        
        // 날씨 정보 가져오기
        const response = await fetch(`${API_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`);
        const data = await response.json();

        if (response.ok) {
            updateWeatherUI(data);
            // 도시 배경 이미지 가져오기
            await updateBackgroundImage(city);
        } else {
            showToast('도시를 찾을 수 없습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('날씨 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
        // 로딩 상태 제거
        document.querySelector('.weather-card').classList.remove('loading');
    }
}

async function updateBackgroundImage(city) {
    try {
        const response = await fetch(`${UNSPLASH_API_URL}?query=${city}&orientation=landscape&per_page=1`, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.regular;
            const backgroundImage = document.getElementById('background-image');
            const backgroundOverlay = document.getElementById('background-overlay');
            
            // 배경 이미지 페이드 아웃
            backgroundImage.style.opacity = '0';
            backgroundOverlay.style.opacity = '0';
            
            // 새로운 이미지 로드 후 페이드 인
            setTimeout(() => {
                backgroundImage.style.backgroundImage = `url(${imageUrl})`;
                backgroundImage.style.opacity = '1';
                backgroundOverlay.style.opacity = '0.5';
            }, 500);
        }
    } catch (error) {
        console.error('Error fetching background image:', error);
    }
}

function updateWeatherUI(data) {
    const location = data.location;
    const current = data.current;

    document.getElementById('city-name').textContent = `${location.name}, ${location.country}`;
    document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
    document.getElementById('temp-c').textContent = `${current.temp_c}°C`;
    document.getElementById('temp-f').textContent = `${current.temp_f}°F`;
    document.getElementById('condition').textContent = current.condition.text;
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('wind-speed').textContent = `${current.wind_kph} km/h`;

    // 날씨 카드에 애니메이션 효과 추가
    const weatherCard = document.querySelector('.weather-card');
    weatherCard.classList.add('animate-fadeIn');
}

function showToast(message) {
    // Bootstrap 토스트 생성
    const toastContainer = document.createElement('div');
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '11';
    
    toastContainer.innerHTML = `
        <div class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    document.body.appendChild(toastContainer);
    const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toast.show();
    
    // 토스트가 사라진 후 DOM에서 제거
    toastContainer.querySelector('.toast').addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}

// Enter 키로 검색 가능하도록 설정
document.getElementById('city-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});
